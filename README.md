# API Developer Competition README

Introducing a cutting-edge platform designed to seamlessly automate recruitment interviews. By leveraging the power of Gemini for AI-driven conversation, Firebase for robust data management, and ElevenLabs for advanced voice synthesis, our solution ensures a natural and engaging candidate experience while providing comprehensive evaluation tools for recruiters.


[![Talent Pro](https://img.youtube.com/vi/qvLNeIMIlLw/0.jpg)](https://youtu.be/qvLNeIMIlLw)



## Prerequisites

Before starting, make sure you have the following installed and set up:

1. **Node Version Manager (NVM)**
   - **Installation**: Follow these steps to install NVM on your machine:
     1. Download and install NVM by following the instructions [here](https://github.com/coreybutler/nvm-windows).
     2. Once installed, verify the installation by running:
        ```bash
        nvm --version
        ```
     3. Install Node.js versions 16.13.0 and 18.20.3 using NVM:
        ```bash
        nvm install 16.13.0
        nvm install 18.20.3
        ```

2. **API Key for AIStudio**
   - Obtain an API key from AIStudio.

3. **API Key for ElevenLabs**
   - Obtain an API key from ElevenLabs. If you are a Google evaluator, please contact me, and I will provide my API key (email: josepablocif16@gmail.com).

4. **Firebase Project**
   - Ensure you have a Firebase project set up. You will need the configuration details for this project later.

## Pre-Configuration

Before proceeding with the installation, you need to configure your API keys and Firebase settings:

### 1. API Folder Configuration

- Navigate to the `API` folder in the project.
- Open the `...\API\.env.example` file and input your API keys for Gemini and ElevenLabs.
- Rename the file by removing the `.example` suffix

- Open the `...\API\firebaseConfig.js.example` file and input your Firebase configuration.
- Rename the file by removing the `.example` suffix


### 2. Gemini-Competition Folder Configuration

- Navigate to the `gemini-competition` folder.
- Open the `...\src\environments\environment.ts.example` file and input your Firebase configuration.
- Rename the file by removing the `.example` suffix

## Installation

Once you have completed the pre-configuration, follow these steps to install the project:

1. Navigate to the `gemini-competition` directory:
   ```bash
   cd API-Developer-Competition/gemini-competition
   ```
2. Use Node.js version 16.13.0:
   ```bash
   nvm use 16.13.0
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

4. Navigate to the `API` directory:
   ```bash
   cd ../API
   ```
5. Use Node.js version 18.20.3:
   ```bash
   nvm use 18.20.3
   ```
6. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Angular UI

To launch the Angular UI, ensure you are in the `gemini-competition` directory:

1. Use Node.js version 16.13.0:
   ```bash
   nvm use 16.13.0
   ```
2. Start the Angular development server:
   ```bash
   ng serve -o
   ```

### Running the Server

To run the server, ensure you are in the `API` directory:

1. Use Node.js version 18.20.3:
   ```bash
   nvm use 18.20.3
   ```
2. Start the server:
   ```bash
   node index.js
   ```
