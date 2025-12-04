🤖 Smart Board Buddy: Automated Whiteboard Eraser System (ROS Simulation)

Project Overview

The Smart Board Buddy is a Senior Capstone project simulating an advanced robotic system for classroom whiteboard management. The primary goal is to automate the erasure process (Full or Partial Erase) to save teacher time and ensure accessibility for students by digitally archiving notes.

This is a simulation interface built to validate the core system logic, communication, and adherence to safety and performance constraints before deploying to the physical robotic hardware (ROS/Kinova).

✨ Core Requirements Implemented

The interface demonstrates compliance with the following critical requirements:

Erase Control (FR2): Supports one-touch Full Board Erase and Partial Erase via selection on the interactive canvas (Fabric.js).

Safety & Pause (FR4, NFR3): Includes a function to Simulate Obstacle, automatically pausing the operation if the system detects an object within 0.5m.

Performance (NFR1): The erase process is timed to complete within the 10-second target for a standard 4ft x 6ft whiteboard.

Digital Archiving (Story 7): Allows users to save a snapshot of the current canvas state to the Supabase database before initiating erasure.

Accessibility Alert (Story 6): Displays a clear, mandatory 10-second countdown before any erase operation begins.

🛠️ Technical Stack & Configuration

The application is built on a modern Vite + React + TypeScript stack, utilizing professional component libraries and a clear structure.

Frontend: React (TSX) ⚛️

Styling/Components: Tailwind CSS, shadcn/ui (configured via components.json)

Canvas Library: Fabric.js

Build Tool: Vite (Development port confirmed as 8080 in vite.config.ts)

Database: Supabase (@supabase/supabase-js) 🟢

🚀 Getting Started (Local Development)

Prerequisites

You must have Node.js (LTS recommended) and a package manager (npm, yarn, or bun) installed. You will also need credentials for a Supabase project.

1. Installation

Clone the repository and install dependencies:

git clone [https://github.com/The-MP5/smart-board-buddy.git](https://github.com/The-MP5/smart-board-buddy.git)
cd smart-board-buddy
npm install 


2. Supabase Setup

The simulation requires database credentials for storing persistent data (logs and snapshots).

Create a Supabase project and find your Project URL and Anon Public Key.

Create a .env file in the project root:

# Supabase Credentials
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"



Ensure your Supabase instance includes tables for Notes (for snapshots) and SystemLogs (for NFR2 compliance).

3. Running the Simulator

The development server is configured to run on port 8080:

npm run dev


The simulator will be available at http://localhost:8080.

🧪 Testing & Verification Approach

The project adheres to the documented Agile Testing Approach, emphasizing integration across different system layers:

Unit Testing: Validating isolated logic functions (e.g., coordinate conversion).

HIL (Hardware-in-the-Loop) Testing: Testing the simulated ROS/Kinematics control flow.

Integration Testing: Verifying the full E2E digital flow (UI to API to Supabase).

UAT: Manual verification of usability and safety features by end-users.

Created by Group 21: Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta
