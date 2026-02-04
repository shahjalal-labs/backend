# 📁 Project Structure

```bash
.
├── bun.lock
├── ecosystem.config.js
├── msg.md
├── package.json
├── package-lock.json
├── prisma
│   └── schema.prisma
├── README.md
├── src
│   ├── app
│   │   ├── interfaces
│   │   │   ├── common.ts
│   │   │   └── file.ts
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── entry.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── optionalAuth.ts
│   │   │   ├── parseBodyData.ts
│   │   │   ├── postman.ts
│   │   │   ├── profile.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules
│   │   │   ├── auth
│   │   │   │   ├── auth.api.hurl
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── authFullContent.md
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.validation.ts
│   │   │   │   └── profiledata.md
│   │   │   ├── chat
│   │   │   │   ├── chat.api.hurl
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.routes.ts
│   │   │   │   └── chat.service.ts
│   │   │   ├── ChecklistEndGoal
│   │   │   │   ├── checklistEndGoal.api.hurl
│   │   │   │   ├── checklistEndGoal.controller.ts
│   │   │   │   ├── ChecklistEndGoalFullContent.md
│   │   │   │   ├── checklistEndGoal.routes.ts
│   │   │   │   ├── checklistEndGoal.service.ts
│   │   │   │   └── checklistEndGoal.validation.ts
│   │   │   ├── Group
│   │   │   │   ├── group.api.hurl
│   │   │   │   ├── group.controller.ts
│   │   │   │   ├── GroupFullContent.md
│   │   │   │   ├── group.http.env.json
│   │   │   │   ├── group.routes.ts
│   │   │   │   ├── group.service.ts
│   │   │   │   ├── group.validation.ts
│   │   │   │   └── kulala
│   │   │   │       ├── basic.http
│   │   │   │       ├── group.api.http
│   │   │   │       └── variables.http
│   │   │   ├── mentorProgress
│   │   │   │   ├── mentorProgress.api.hurl
│   │   │   │   ├── mentorProgress.controller.ts
│   │   │   │   ├── mentorProgressFullContent.md
│   │   │   │   ├── mentorProgress.routes.ts
│   │   │   │   ├── mentorProgress.service.ts
│   │   │   │   └── mentorProgress.validation.ts
│   │   │   ├── network
│   │   │   │   ├── matchsuggestionlogic.md
│   │   │   │   ├── network.api.hurl
│   │   │   │   ├── network.controller.ts
│   │   │   │   ├── networkFullContent.md
│   │   │   │   ├── network.routes.ts
│   │   │   │   ├── network.service.ts
│   │   │   │   └── network.validation.ts
│   │   │   ├── Notification
│   │   │   │   ├── notification.api.hurl
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── notification.routes.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── notification.validation.ts
│   │   │   ├── Schedule
│   │   │   │   ├── schedule.api.hurl
│   │   │   │   ├── schedule.controller.ts
│   │   │   │   ├── schedule.routes.ts
│   │   │   │   ├── schedule.service.ts
│   │   │   │   └── schedule.validation.ts
│   │   │   ├── socket
│   │   │   │   ├── handlers
│   │   │   │   │   └── chat.handler.ts
│   │   │   │   ├── socket.controller.ts
│   │   │   │   ├── socketFullContent.md
│   │   │   │   ├── socket.interface.ts
│   │   │   │   ├── socket.note.md
│   │   │   │   ├── socket.service.ts
│   │   │   │   └── wstest.json
│   │   │   └── user
│   │   │       ├── user.api.hurl
│   │   │       ├── user.controller.ts
│   │   │       ├── user.interface.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.services.ts
│   │   │       └── user.validation.ts
│   │   └── routes
│   │       └── index.ts
│   ├── app.ts
│   ├── config
│   │   ├── index.ts
│   │   └── serviceAccount.ts
│   ├── docs
│   │   └── cli_commands.md
│   ├── errors
│   │   ├── ApiErrors.ts
│   │   ├── handleClientError.ts
│   │   ├── handleValidationError.ts
│   │   ├── handleZodError.ts
│   │   └── parsePrismaValidationError.ts
│   ├── helpers
│   │   ├── fileUploader.ts
│   │   ├── firebaseAdmin.ts
│   │   ├── generateOtp.ts
│   │   ├── jwtHelpers.ts
│   │   ├── onboardingHtml.ts
│   │   └── sendEmail.ts
│   ├── interfaces
│   │   ├── common.ts
│   │   ├── error.ts
│   │   ├── file.ts
│   │   ├── index.d.ts
│   │   └── paginations.ts
│   ├── jobs
│   │   ├── bullBoard.ts
│   │   ├── jobsFullContent.md
│   │   ├── queues
│   │   │   ├── emailQueue.ts
│   │   │   └── notificationQueue.ts
│   │   └── workers
│   │       ├── emailWorker.ts
│   │       └── notificationWorker.ts
│   ├── resource
│   │   └── requirements.md
│   ├── server.ts
│   ├── shared
│   │   ├── catchAsync.ts
│   │   ├── paginationHelper.ts
│   │   ├── pick.ts
│   │   ├── prisma.ts
│   │   ├── redis-services
│   │   │   ├── chat.service.ts
│   │   │   └── otp.service.ts
│   │   ├── redis.ts
│   │   ├── searchFilter.ts
│   │   ├── sendResponse.ts
│   │   ├── uploadInSpace.ts
│   │   └── userSearch.ts
│   └── utils
│       └── getUserOrThrow.ts
├── structure.md
├── tsconfig.json
├── uploads
│   └── google.png
└── vercel.json

33 directories, 126 files

```
