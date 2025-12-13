const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const users = [];
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@blog.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'System administrator and blog maintainer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });
  users.push(admin);
  console.log(`👑 Created admin user: ${admin.username}`);

  // Create regular users
  const regularUsers = [
    {
      email: 'alice@blog.com',
      username: 'alice',
      password: await bcrypt.hash('password123', 10),
      bio: 'Frontend developer and tech enthusiast',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    },
    {
      email: 'bob@blog.com',
      username: 'bob',
      password: await bcrypt.hash('password123', 10),
      bio: 'Backend engineer and database expert',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    },
    {
      email: 'charlie@blog.com',
      username: 'charlie',
      password: await bcrypt.hash('password123', 10),
      bio: 'Full-stack developer and open source contributor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
    },
    {
      email: 'diana@blog.com',
      username: 'diana',
      password: await bcrypt.hash('password123', 10),
      bio: 'UI/UX designer and creative writer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'
    }
  ];

  for (const userData of regularUsers) {
    const user = await prisma.user.create({
      data: userData
    });
    users.push(user);
    console.log(`👤 Created user: ${user.username}`);
  }

  // Create tags
  const tags = [
    'JavaScript',
    'React',
    'Node.js',
    'TypeScript',
    'Web Development',
    'Programming',
    'Tutorial',
    'Beginner',
    'Advanced',
    'Tips & Tricks'
  ];

  const tagRecords = [];
  for (const tagName of tags) {
    const tag = await prisma.tag.create({
      data: { name: tagName }
    });
    tagRecords.push(tag);
    console.log(`🏷️  Created tag: ${tag.name}`);
  }

  // Create posts
  const posts = [
    {
      title: 'Getting Started with React',
      content: `React is a popular JavaScript library for building user interfaces. In this tutorial, we'll cover the basics of React, including components, props, and state.

## What is React?
React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called "components".

## Key Concepts
1. **Components**: Building blocks of React applications
2. **Props**: Inputs to components (read-only)
3. **State**: Internal data that can change over time
4. **Hooks**: Functions that let you use state and other React features

## Getting Started
\`\`\`javascript
import React from 'react';

function Welcome() {
  return <h1>Hello, React!</h1>;
}

export default Welcome;
\`\`\`

React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.`,
      authorId: users[1].id,
      tags: ['React', 'JavaScript', 'Beginner', 'Tutorial']
    },
    {
      title: 'Building REST APIs with Node.js and Express',
      content: `In this guide, we'll learn how to build a RESTful API using Node.js and Express. We'll cover routing, middleware, error handling, and database integration.

## What is REST?
REST (Representational State Transfer) is an architectural style for designing networked applications. A REST API uses HTTP requests to perform CRUD operations.

## Setting Up Express
\`\`\`javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Best Practices
1. Use proper HTTP methods (GET, POST, PUT, DELETE)
2. Implement proper error handling
3. Use middleware for common tasks
4. Validate input data
5. Implement authentication and authorization`,
      authorId: users[2].id,
      tags: ['Node.js', 'Express', 'Backend', 'API', 'Web Development']
    },
    {
      title: 'TypeScript Tips for JavaScript Developers',
      content: `TypeScript adds static typing to JavaScript, helping catch errors early and improve code quality. Here are some tips for JavaScript developers transitioning to TypeScript.

## Why TypeScript?
- **Type Safety**: Catch errors during development
- **Better Tooling**: Improved autocomplete and refactoring
- **Enhanced Readability**: Self-documenting code
- **Scalability**: Better for large applications

## Basic Types
\`\`\`typescript
let username: string = 'John';
let age: number = 30;
let isActive: boolean = true;
let scores: number[] = [95, 87, 92];
let user: { name: string; age: number } = { name: 'Alice', age: 25 };

// Type inference
let inferredString = 'Hello'; // TypeScript infers 'string'
let inferredNumber = 42;      // TypeScript infers 'number'
\`\`\`

## Interfaces and Types
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional property
}

type Status = 'active' | 'inactive' | 'pending';

function getUserStatus(user: User): Status {
  return user.isAdmin ? 'active' : 'inactive';
}
\`\`\`

TypeScript can significantly improve your development workflow and code maintainability. Start with basic types and gradually explore advanced features.`,
      authorId: users[3].id,
      tags: ['TypeScript', 'JavaScript', 'Programming', 'Tips & Tricks']
    },
    {
      title: '10 Web Development Tools You Should Know',
      content: `The web development ecosystem is vast, but some tools are essential for every developer. Here are 10 tools that can boost your productivity.

## 1. VS Code
Visual Studio Code is a powerful code editor with excellent TypeScript support, extensions, and debugging capabilities.

## 2. Git & GitHub
Version control is essential for collaboration. Git tracks changes, while GitHub provides hosting and collaboration features.

## 3. Chrome DevTools
Built into Chrome, DevTools helps with debugging, performance analysis, and responsive design testing.

## 4. Postman
Test and document APIs with Postman's intuitive interface.

## 5. Figma
Design and prototype interfaces with Figma's collaborative design tools.

## 6. Docker
Containerize your applications for consistent development and deployment environments.

## 7. Jest
Testing framework for JavaScript with a focus on simplicity.

## 8. Webpack
Module bundler that transforms and bundles your assets.

## 9. ESLint
Find and fix problems in your JavaScript code.

## 10. Tailwind CSS
Utility-first CSS framework for rapid UI development.

Each tool serves a specific purpose in the development workflow. Mastering these can significantly improve your efficiency.`,
      authorId: users[4].id,
      tags: ['Web Development', 'Tools', 'Productivity', 'Tips & Tricks']
    },
    {
      title: 'Understanding Async/Await in JavaScript',
      content: `Async/await makes asynchronous code easier to write and read. Let's explore how it works and best practices.

## The Problem with Callbacks
Nested callbacks (callback hell) make code hard to read and maintain.

## Promises to the Rescue
Promises provide a cleaner way to handle asynchronous operations.

## Async/Await Syntax
\`\`\`javascript
// Traditional promise
function fetchData() {
  return fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

// With async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## Error Handling
Always use try/catch blocks with async/await to handle errors gracefully.

## Best Practices
1. Use try/catch for error handling
2. Handle multiple promises with Promise.all()
3. Don't forget the await keyword
4. Consider error boundaries for complex applications

Async/await is syntactic sugar over promises, making asynchronous code look synchronous and easier to understand.`,
      authorId: users[1].id,
      tags: ['JavaScript', 'Async/Await', 'Programming', 'Advanced']
    }
  ];

  const postRecords = [];
  for (const postData of posts) {
    const post = await prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        excerpt: postData.content.substring(0, 150) + '...',
        authorId: postData.authorId,
        tags: {
          connect: postData.tags.map(tagName => ({
            name: tagName
          }))
        }
      }
    });
    postRecords.push(post);
    console.log(`📝 Created post: ${post.title}`);
  }

  // Create comments
  const comments = [
    {
      content: 'Great introduction to React! Looking forward to more advanced topics.',
      authorId: users[2].id,
      postId: postRecords[0].id
    },
    {
      content: 'This helped me understand the basics. Thanks for the clear explanation!',
      authorId: users[3].id,
      postId: postRecords[0].id
    },
    {
      content: 'Express middleware is powerful. Do you have examples of custom middleware?',
      authorId: users[1].id,
      postId: postRecords[1].id
    },
    {
      content: 'TypeScript has been a game-changer for our team. The type safety is invaluable.',
      authorId: users[4].id,
      postId: postRecords[2].id
    },
    {
      content: 'VS Code + Git is my daily setup. Couldn\'t agree more with this list!',
      authorId: users[0].id,
      postId: postRecords[3].id
    },
    {
      content: 'Async/await made my code so much cleaner. Great explanation!',
      authorId: users[3].id,
      postId: postRecords[4].id
    }
  ];

  for (const commentData of comments) {
    await prisma.comment.create({
      data: commentData
    });
  }
  console.log(`💬 Created ${comments.length} comments`);

  // Create likes
  const likes = [
    { userId: users[0].id, postId: postRecords[0].id },
    { userId: users[1].id, postId: postRecords[0].id },
    { userId: users[2].id, postId: postRecords[0].id },
    { userId: users[3].id, postId: postRecords[1].id },
    { userId: users[4].id, postId: postRecords[1].id },
    { userId: users[1].id, postId: postRecords[2].id },
    { userId: users[2].id, postId: postRecords[3].id },
    { userId: users[3].id, postId: postRecords[4].id }
  ];

  for (const likeData of likes) {
    await prisma.like.create({
      data: likeData
    });
  }
  console.log(`❤️  Created ${likes.length} likes`);

  // Create follows
  const follows = [
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[1].id },
    { followerId: users[3].id, followingId: users[2].id },
    { followerId: users[4].id, followingId: users[3].id },
    { followerId: users[0].id, followingId: users[4].id }
  ];

  for (const followData of follows) {
    await prisma.follow.create({
      data: followData
    });
  }
  console.log(`👥 Created ${follows.length} follows`);

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Tags: ${tagRecords.length}`);
  console.log(`- Posts: ${postRecords.length}`);
  console.log(`- Comments: ${comments.length}`);
  console.log(`- Likes: ${likes.length}`);
  console.log(`- Follows: ${follows.length}`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });