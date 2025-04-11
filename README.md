<p align="center">
  <a href="https://angular.io/" target="_blank"><img src="https://angular.io/assets/images/logos/angular/angular.svg" width="150" alt="Angular Logo" /></a>
</p>

# Todo Lists App

## Description

This project is a simple yet functional web application for managing to-do lists, developed according to the specified requirements. It allows users to view multiple lists, manage tasks within those lists, and interact with a backend REST API for data operations. The application features state management, local storage persistence, and a responsive design.

Built with Angular (v15+), TypeScript, and styled using Tailwind CSS.

## Features

- **View Todo Lists:** Displays a list of all available to-do lists.
- **List Summary:** Each list item shows its title and a summary of task counts (total tasks, completed tasks).
- **Detailed Task View:** Selecting a list reveals its tasks, each showing title, description (if available), and completion status.
- **Select/Deselect List:** Click a list to view its details; click the same list again to hide the details.
- **Add New List:** Users can add new to-do lists by providing a title.
- **Add New Task:** Within a selected list's detail view, users can add new tasks with a title and an optional description.
- **Toggle Task Status:** Users can mark tasks as completed or incomplete directly in the detail view.
- **Data Persistence:** Application state (lists and tasks) is saved to the browser's Local Storage, ensuring data retention across page reloads. Data is loaded from Local Storage first on startup. _(See Persistence Notes below)_
- **API Integration:** Full integration with a backend REST API for all CRUD (Create, Read, Update) operations on lists and tasks.
- **Responsive Design:** The UI adapts to different screen sizes using Tailwind CSS utility classes.

## Tech Stack & Implementation Details

- **Framework:** Angular (v15+, utilizing Standalone Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Centralized state managed via `TodoStateService` using RxJS `BehaviorSubject` for holding state and exposing `Observable` streams for reactive consumption by components. Task counts (total/completed) are calculated dynamically in the service after data fetching.
- **HTTP Communication:** Angular's `HttpClient` module for interacting with the backend REST API.
- **API Integration:** The application integrates with the following backend endpoints:
  - `GET /todos`: Fetches all lists and their associated items.
  - `POST /todos`: Creates a new, empty list (requires `{ title: string }`).
  - `POST /todos/:listId/items`: Adds a new item to a specific list (requires `{ title: string, description?: string }`).
  - `PATCH /todos/:listId/items/:itemId`: Updates the completion status of a specific item (requires `{ completed: boolean }`).
  - _(Note: Assumes string IDs for lists and items)_
- **Persistence:** Uses the browser's `localStorage` API within the `TodoStateService`. On application startup, it attempts to load state from storage. If successful, the initial API call is skipped. Fetched/updated data from the API is always saved back to local storage.
- **Persistence Notes & Data Consistency:**
  - **Important:** `localStorage` is browser-specific and user-specific. This persistence method is suitable for single-user scenarios on a consistent browser. It **does not** synchronize data across different users, browsers, or devices. Relying solely on `localStorage` in a multi-user environment would lead to data inconsistencies.
  - The current strategy of **re-fetching the entire list data from the API** after every successful create, update operation (add list, add item, toggle item) helps mitigate some potential frontend state inconsistencies. Instead of attempting complex client-side patching of the data array, this ensures the frontend always displays the latest state _according to the backend_ after a modification, which also updates the local storage cache correctly.
- **Configuration:** API base URL and Local Storage key are managed via Angular's environment files (`src/environments/environment.ts` and `src/environments/environment.prod.ts`), allowing for different configurations per build environment.
- **Unit Testing:** Basic unit tests are included for core components (`TodoListComponent`, `TodoDetailComponent`) using Jasmine and Angular's `TestBed` to verify fundamental functionality and service interactions.
- **Code Quality:** Follows Angular and TypeScript best practices. Project configured with **ESLint** for linting and **Prettier** for code formatting to ensure consistency and maintainability.

## Getting Started

### Prerequisites

- Node.js (Version compatible with Angular CLI - e.g., v16.14+ or v18.10+)
- npm package manager
- A running instance of the backend API (configured in `src/environments/environment.ts`)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    - Ensure the `apiUrl` in `src/environments/environment.ts` points to your local backend API instance (e.g., `http://localhost:3000`).
