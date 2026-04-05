# BuddyScript - High-Performance Social Media Platform

BuddyScript is a modern, scalable social media web application built with **Laravel 12** and **React 18**. It features a real-time feel, threaded comments, and a high-performance feed capable of handling millions of posts.

---

## 🚀 Key Features

- **Infinite Scrolling Feed**: Seamlessly scroll through thousands of posts using cursor-based pagination and Intersection Observer.
- **Optimized Performance**: 
    - **Redis Counters**: Likes and Membership checks are handled in Redis (O(1)) to prevent database strain.
    - **Counter Caches**: Post likes and comment counts are stored directly on the table, eliminating N+1 query bottlenecks.
    - **Shallow Eager Loading**: Efficient data retrieval that only fetches what is necessary for the current view.
- **Threaded Comments**: Support for parent comments and nested replies with independent pagination.
- **Post Management**: Create, edit, and delete posts with custom privacy settings (Public/Private).
- **Authentication**: Secure JWT-based API authentication.
- **Robust Authorization**: Fine-grained Policies (Post, Comment, User) ensuring users can only manage their own content.

---

## 🛠 Tech Stack

- **Backend**: PHP 8.2+, Laravel 12
- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS
- **Database**: MySQL (optimized with indices and counter caches)
- **Cache/NoSQL**: Redis (used for likes tracking and fast membership checks)
- **Auth**: JWT (JSON Web Token)

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd buddy-project
   ```

2. **Backend Setup**:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   ```

3. **Database & Redis**:
   - Configure your `.env` with your MySQL and Redis credentials.
   - Run migrations:
     ```bash
     php artisan migrate
     ```

4. **Frontend Setup**:
   ```bash
   npm install
   ```

5. **Running the Application**:
   - In terminal 1 (Vite):
     ```bash
     npm run dev
     ```
   - In terminal 2 (Laravel):
     ```bash
     php artisan serve
     ```

---

## 🧪 Testing with Demo Data

We have included a specialized **DemoSeeder** designed to test the system at scale (10,000+ posts).

To seed the database with demo users, posts, and comments:
```bash
php artisan db:seed --class=DemoSeeder
```
*Note: This will preserve the user `nayakemily50@gmail.com` if it exists.*

---

## 🛡 Security & Authorization

The project follows strict Laravel Authorization patterns:
- **PostPolicy**: Determines who can view (based on privacy), update, or delete a post.
- **CommentPolicy**: Ensures only authors or post owners can manage comments.
- **UserPolicy**: Restricts profile updates and account deletions to the account owner.

---

## 📈 Scalability Highlights

- **N+1 Fixes**: Reduced typical feed page from ~35 queries down to 2-3 queries.
- **Redis Membership**: Used for checking if a user liked a post, preventing millions of `SELECT EXISTS` queries on the DB.
- **Cursor Pagination**: Uses `last_id` instead of `OFFSET`, preventing performance degradation as the database grows to millions of rows.

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
