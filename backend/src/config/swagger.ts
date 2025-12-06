import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'i-eSchool Admin Panel API',
      version: '1.0.0',
      description: 'REST API for managing classes, students, attendance, and activity logs',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Classes', description: 'Class management endpoints' },
      { name: 'Students', description: 'Student management endpoints' },
      { name: 'Attendance', description: 'Attendance tracking endpoints' },
      { name: 'Activity', description: 'Activity log endpoints' },
      { name: 'Teams Integration', description: 'Microsoft Teams integration' },
      { name: 'Health', description: 'Health check' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        Class: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Biology 101' },
            teacher: { type: 'string', example: 'Dr. Smith' },
            numberOfStudents: { type: 'number', example: 25 },
            description: { type: 'string', example: 'Introduction to Biology' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            className: { type: 'string', example: 'Biology 101' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            status: { type: 'string', enum: ['Active', 'Inactive'], example: 'Active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            studentId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            studentName: { type: 'string', example: 'John Doe' },
            className: { type: 'string', example: 'Biology 101' },
            date: { type: 'string', format: 'date', example: '2025-12-06' },
            status: { type: 'string', enum: ['Present', 'Absent'], example: 'Present' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            action: { type: 'string', example: 'Student enrolled' },
            entityType: { type: 'string', example: 'student' },
            entityId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            description: { type: 'string', example: 'John Doe - Biology 101' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'name' },
                  message: { type: 'string', example: 'Name is required' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to route files with JSDoc annotations
};

export const swaggerSpec = swaggerJsdoc(options);
