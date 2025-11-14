import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Exam Prep API',
      version: '1.0.0',
      description: 'API documentation for Exam Prep application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Question ID',
            },
            question: {
              type: 'string',
              description: 'Question text',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of answer options',
            },
            correctAnswer: {
              type: 'integer',
              description: 'Index of the correct answer (0-based)',
            },
            category: {
              type: 'string',
              description: 'Question category',
            },
          },
        },
        QuizAnswer: {
          type: 'object',
          properties: {
            questionId: {
              type: 'integer',
              description: 'Question ID',
            },
            selectedAnswer: {
              type: 'integer',
              description: 'Selected answer index (0-based)',
            },
          },
          required: ['questionId', 'selectedAnswer'],
        },
        QuizSubmission: {
          type: 'object',
          properties: {
            answers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/QuizAnswer',
              },
              description: 'Array of quiz answers',
            },
          },
          required: ['answers'],
        },
        QuizResult: {
          type: 'object',
          properties: {
            score: {
              type: 'integer',
              description: 'Number of correct answers',
            },
            total: {
              type: 'integer',
              description: 'Total number of questions',
            },
            percentage: {
              type: 'integer',
              description: 'Score percentage',
            },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionId: {
                    type: 'integer',
                  },
                  question: {
                    type: 'string',
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  selectedAnswer: {
                    type: 'integer',
                  },
                  correctAnswer: {
                    type: 'integer',
                  },
                  isCorrect: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            token: {
              type: 'string',
              description: 'JWT authentication token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

