# Interview Prepper Setup

## Getting Started

This app generates personalized interview questions based on your resume and job descriptions using Google's Gemini AI.

### Quick Start

1. **Clone and install:**

   ```bash
   cd interview-prepper
   pnpm install
   pnpm dev
   ```

2. **Visit the app:**
   - Go to `http://localhost:3000`
   - Click "Generate Questions Now" to start using the app

### API Configuration (Optional)

The app generates personalized questions by analyzing your resume and job description by default. To get AI-enhanced questions:

1. **Get a Gemini API key:**

   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free API key

2. **Configure the API key:**

   - Create a `.env.local` file in the project root
   - Add your API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Restart the development server:**
   ```bash
   pnpm dev
   ```

## Features

- **Resume Upload**: Upload PDF, DOC, or text files, or paste content directly
- **Job Description Input**: Paste any job posting
- **Intelligent Question Generation**:
  - Analyzes your resume content (experience, technologies, leadership background)
  - Extracts job requirements (technologies, seniority level, company culture)
  - Generates 5-6 personalized interview questions based on the analysis
  - Works without API key - gets even better with Gemini AI
- **Question Categories**: Technical, Experience, Leadership, Culture Fit, Role-Specific, and Professional Growth
- **Personalized Tips**: Each question includes specific advice based on your background
- **Smart Matching**: Questions highlight technology overlaps and skill gaps between your resume and the job

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Radix UI** for accessible components
- **Google Generative AI** (Gemini) for question generation
- **pnpm** for package management

## Usage

1. Navigate to the main page
2. Click "Generate Questions Now"
3. Upload your resume or paste the content
4. Paste the job description you're applying for
5. Click "Generate Interview Questions"
6. Practice with your personalized questions!

The app works offline with sample questions if no API key is configured.
