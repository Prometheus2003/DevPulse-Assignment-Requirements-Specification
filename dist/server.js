

            import { createRequire } from 'module';

            const require = createRequire(import.meta.url);

         

// src/app.ts
import express from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connectionString: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/modules/users/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(
      `
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )`
    );
    await pool.query(`CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(20) NOT NULL DEFAULT 'open' 
                CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );`);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
};

// src/modules/users/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *
    `, [name, email, hashPassword]);
  delete result.rows[0].password;
  return result.rows[0];
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
        `);
  delete result.rows[0].password;
  return result.rows;
};
var getUsersByIdsFromDB = async (ids) => {
  if (!ids.length) return [];
  const result = await pool.query(`
            SELECT id,name,role FROM users WHERE id = ANY($1)
        `, [ids]);
  delete result.rows[0].password;
  return result.rows;
};
var updateUserInDB = async (id, payload) => {
  const { name, password } = payload;
  const result = await pool.query(
    `
    UPDATE users 
    SET 
    name = COALESCE($1, name),
    password = COALESCE($2, password),
    updated_at = NOW() 
    WHERE id = $3 RETURNING *
    `,
    [name, password, id]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM users WHERE id = $1 RETURNING *
    `, [id]);
  return result.rows[0];
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUsersByIdsFromDB,
  updateUserInDB,
  deleteUserFromDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/users/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User Created Successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      message: "Users retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error
    });
  }
};
var getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getUsersByIdsFromDB([Number(id)]);
    if (result.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.status(200).json({
      message: "User retrieved successfully",
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserInDB(id, req.body);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

// src/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt.verify(token, config_default.secret);
      const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
            `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_middleware_default = auth;

// src/middleware/role.middleware.ts
var role = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission"
      });
    }
    next();
  };
};
var role_middleware_default = role;

// src/modules/users/user.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get(
  "/",
  auth_middleware_default(),
  role_middleware_default(["maintainer"]),
  userController.getAllUsers
);
router.get("/:id", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), userController.getUserById);
router.put("/:id", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), userController.updateUser);
router.delete(
  "/:id",
  auth_middleware_default(),
  role_middleware_default(["maintainer"]),
  userController.deleteUser
);
var userRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *
    `, [title, description, type, reporter_id]);
  return result.rows[0];
};
var getAllIssuesFromDB = async (filters) => {
  const { type, status, sort = "newest" } = filters;
  let query = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    conditions.push(`type = $${values.length}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${values.length}`);
    values.push(status);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(query, values);
  return result.rows;
};
var getIssueByIdFromDB = async (id) => {
  const result = await pool.query(`
            SELECT * FROM issues WHERE id = $1
        `, [id]);
  return result.rows[0];
};
var updateIssueStatusInDB = async (id, userId, payload) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
        UPDATE issues SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            status = COALESCE($4, status),
            updated_at = NOW()
        WHERE id = $5 AND reporter_id = $6
        RETURNING *
        `,
    [title, description, type, status, id, userId]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM issues WHERE id = $1 RETURNING *
    `, [id]);
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  updateIssueStatusInDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const user = req.user;
    const issue = await issueService.createIssueIntoDB({ ...req.body, reporter_id: user.id });
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const issues = await issueService.getAllIssuesFromDB(req.query);
    const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
    const users = await userService.getUsersByIdsFromDB(reporterIds);
    const userMap = {};
    users.forEach((u) => {
      userMap[u.id] = u;
    });
    const formatted = issues.map((issue) => {
      const { reporter_id, created_at, updated_at, ...rest } = issue;
      return {
        id: rest.id,
        title: rest.title,
        description: rest.description,
        type: rest.type,
        status: rest.status,
        reporter: userMap[reporter_id] || null,
        created_at,
        updated_at
      };
    });
    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await issueService.getIssueByIdFromDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    const users = await userService.getUsersByIdsFromDB([issue.reporter_id]);
    const reporter = users[0] || null;
    const { reporter_id, created_at, updated_at, ...rest } = issue;
    const formatted = {
      id: rest.id,
      title: rest.title,
      description: rest.description,
      type: rest.type,
      status: rest.status,
      reporter,
      created_at,
      updated_at
    };
    return res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssueStatus = async (req, res) => {
  const rawId = req.params.id;
  if (!rawId || Array.isArray(rawId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid issue id"
    });
  }
  const id = rawId;
  const user = req.user;
  const userId = user.id;
  try {
    const issue = await issueService.getIssueByIdFromDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    if (user?.role === "contributor" && issue.reporter_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own issue"
      });
    }
    const result = await issueService.updateIssueStatusInDB(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), issueController.createIssue);
router2.get("/", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), issueController.getAllIssues);
router2.get("/:id", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), issueController.getIssueById);
router2.put("/:id", auth_middleware_default(), role_middleware_default(["contributor", "maintainer"]), issueController.updateIssueStatus);
router2.delete("/:id", auth_middleware_default(), role_middleware_default(["maintainer"]), issueController.deleteIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.controller.ts
import "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.secret, { expiresIn: "1d" });
  const refreshToken2 = jwt2.sign(jwtpayload, config_default.refresh_secret, { expiresIn: "1d" });
  return {
    token: accessToken,
    refreshToken: refreshToken2,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var generateFreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = jwt2.verify(
    token,
    config_default.refresh_secret
  );
  const userData = await pool.query(
    `
     SELECT * FROM users WHERE email=$1   
        `,
    [decoded.email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found!!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token: accessToken
  };
};
var signupUserIntoDB = async (payload) => {
  const { name, email, password } = payload;
  const role2 = "contributor";
  const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);
  if (existingUser.rows.length > 0) {
    throw new Error("User already exists with this email!");
  }
  const hashPassword = await bcrypt2.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *
    `, [name, email, hashPassword, role2]);
  delete result.rows[0].password;
  return result.rows[0];
};
var authService = {
  loginUserIntoDB,
  signupUserIntoDB,
  generateFreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateFreshToken(req.cookies.refreshToken);
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  signupUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
router3.post("/signup", authController.signupUser);
var authRoute = router3;

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = ((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:8000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "Express Server",
    "author": "Next Level"
  });
});
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map