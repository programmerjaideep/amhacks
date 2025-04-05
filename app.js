// DOM Elements
const root = document.getElementById("root");
let currentDay = 1;
let completedDays = [];
let currentView = "home";

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Main app initialization
function initApp() {
  renderApp();
  setupEventListeners();

  // Load user progress from localStorage if available
  loadUserProgress();
}

// Load user progress from localStorage
function loadUserProgress() {
  const savedProgress = localStorage.getItem("dsaMasterProgress");

  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    completedDays = progress.completedDays || [];
    currentDay = progress.currentDay || 1;

    updateUI();
  }
}

// Save user progress to localStorage
function saveUserProgress() {
  const progress = {
    completedDays,
    currentDay,
  };

  localStorage.setItem("dsaMasterProgress", JSON.stringify(progress));
}

// Update UI based on the current state
function updateUI() {
  // Update progress bar
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    const progressPercentage = (completedDays.length / 90) * 100;
    progressBar.style.width = `${progressPercentage}%`;
  }

  // Update completed days in the days grid
  const dayItems = document.querySelectorAll(".day-item");
  dayItems.forEach((item) => {
    const day = parseInt(item.dataset.day);

    // Reset classes
    item.classList.remove("completed", "active");

    // Add completed class
    if (completedDays.includes(day)) {
      item.classList.add("completed");
    }

    // Add active class for current day
    if (day === currentDay) {
      item.classList.add("active");
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Event delegation for navigation
  document.addEventListener("click", (e) => {
    // Nav links
    if (e.target.closest(".nav-link")) {
      e.preventDefault();
      const navLink = e.target.closest(".nav-link");
      const view = navLink.dataset.view;
      navigateTo(view);
    }

    // Day items in the grid
    if (e.target.closest(".day-item")) {
      const dayItem = e.target.closest(".day-item");
      const day = parseInt(dayItem.dataset.day);
      loadDayContent(day);
    }

    // Previous and Next day buttons
    if (e.target.closest("button[data-day]")) {
      const button = e.target.closest("button[data-day]");
      const day = parseInt(button.dataset.day);
      loadDayContent(day);
    }

    // Toggle mobile menu
    if (e.target.closest(".hamburger")) {
      document.querySelector(".nav-links").classList.toggle("show");
    }

    // Dark mode toggle
    if (e.target.closest(".dark-mode-toggle")) {
      document.body.classList.toggle("dark-mode");

      // Save preference to localStorage
      const isDarkMode = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode);
    }

    // Solution tabs
    if (e.target.closest(".solution-tab")) {
      const tab = e.target.closest(".solution-tab");
      const language = tab.dataset.language;

      // Remove active class from all tabs
      document.querySelectorAll(".solution-tab").forEach((t) => {
        t.classList.remove("active");
      });

      // Add active class to clicked tab
      tab.classList.add("active");

      // Update content
      const content = document.querySelector(".solution-content");
      if (content) {
        content.innerHTML = `<pre><code>${getDayCodeExample(
          currentDay,
          language
        )}</code></pre>`;
      }
    }

    // Solve Problem button
    if (e.target.closest(".solve-problem-btn")) {
      e.preventDefault();

      // Show a modal or redirect to the problem page
      showNotification(
        "Problem solver will be available in the next update!",
        "info"
      );
    }

    // Resource links
    if (e.target.closest(".resource-link")) {
      e.preventDefault();

      // Show message
      showNotification(
        "Lecture content will be available in the next update!",
        "info"
      );
    }

    // External links
    if (e.target.closest(".external-link")) {
      e.preventDefault();

      // Show message
      showNotification(
        "External resources will be available in the next update!",
        "info"
      );
    }

    // Topic navigation
    if (e.target.closest(".topic-list a")) {
      e.preventDefault();
      const topicLink = e.target.closest(".topic-list a");
      const topicId = topicLink.dataset.topic;

      // Remove active class from all topic links
      document.querySelectorAll(".topic-list a").forEach((link) => {
        link.classList.remove("active");
      });

      // Add active class to the clicked topic link
      topicLink.classList.add("active");

      // Load topic content
      loadTopicContent(topicId);
    }

    // Topic filter in lectures
    if (e.target.closest("[data-topic-filter]")) {
      e.preventDefault();
      const filterLink = e.target.closest("[data-topic-filter]");
      const filter = filterLink.dataset.topicFilter;

      // Remove active class from all filter links
      document.querySelectorAll("[data-topic-filter]").forEach((link) => {
        link.classList.remove("active");
      });

      // Add active class to the clicked filter link
      filterLink.classList.add("active");

      // Filter lectures
      filterLectures(filter);
    }

    // Mark day as completed
    if (e.target.closest("#mark-complete")) {
      if (!completedDays.includes(currentDay)) {
        completedDays.push(currentDay);
        saveUserProgress();
        updateUI();

        // Show success message
        showNotification("Day marked as completed!", "success");

        // Update button text
        const markCompleteBtn = document.querySelector("#mark-complete");
        if (markCompleteBtn) {
          markCompleteBtn.textContent = "Completed ✓";
          markCompleteBtn.classList.add("btn-secondary");
        }
      }
    }
  });
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type} fade-in`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Navigate to a specific view
function navigateTo(view) {
  currentView = view;
  renderApp();

  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.view === view) {
      link.classList.add("active");
    }
  });

  // If navigating to day view but no day was specified, use currentDay
  if (view === "day") {
    saveUserProgress();
  }
}

// Load content for a specific day
function loadDayContent(day) {
  // Make sure day is a number and within valid range
  day = parseInt(day);
  if (isNaN(day) || day < 1 || day > 90) {
    day = 1; // Default to day 1 if invalid
    showNotification("Invalid day number. Showing Day 1 content.", "warning");
  }

  currentDay = day;
  navigateTo("day");
  saveUserProgress();

  // Show a loading notification for better UX
  showNotification(`Loading Day ${day} content...`, "info");
}

// Load content for a specific topic
function loadTopicContent(topicId) {
  // Simulate loading content
  const contentElement = document.querySelector(".lecture-content");
  if (contentElement) {
    contentElement.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';

    // Simulate API call or content loading
    setTimeout(() => {
      contentElement.innerHTML = getTopicContent(topicId);
    }, 500);
  }
}

// Render the application based on the current view
function renderApp() {
  // Clear root element
  root.innerHTML = "";

  // Add header
  root.appendChild(createHeader());

  // Create main content container
  const main = document.createElement("main");
  const container = document.createElement("div");
  container.className = "container";
  main.appendChild(container);

  // Render view based on currentView
  switch (currentView) {
    case "home":
      container.appendChild(createHomeView());
      break;
    case "challenges":
      container.appendChild(createChallengesView());
      break;
    case "docs":
      container.appendChild(createDocsView());
      break;
    case "lectures":
      container.appendChild(createLecturesView());
      break;
    case "day":
      container.appendChild(createDayView(currentDay));
      break;
    default:
      container.appendChild(createHomeView());
  }

  // Add footer
  root.appendChild(main);
  root.appendChild(createFooter());
}

// Create header element
function createHeader() {
  const header = document.createElement("header");
  const container = document.createElement("div");
  container.className = "container";

  container.innerHTML = `
    <nav>
      <div class="logo">
        <i class="fas fa-code"></i> DSA Master
      </div>
      <ul class="nav-links">
        <li><a href="#" class="nav-link active" data-view="home">Home</a></li>
        <li><a href="#" class="nav-link" data-view="challenges">90-Day Challenge</a></li>
        <li><a href="#" class="nav-link" data-view="docs">Documentation</a></li>
        <li><a href="#" class="nav-link" data-view="lectures">Lectures</a></li>
      </ul>
      <div class="dark-mode-toggle">
        <span class="sun"><i class="fas fa-sun"></i></span>
        <span class="moon"><i class="fas fa-moon"></i></span>
      </div>
      <div class="hamburger">
        <i class="fas fa-bars"></i>
      </div>
    </nav>
  `;

  header.appendChild(container);

  // Check if dark mode is enabled
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  return header;
}

// Create footer element
function createFooter() {
  const footer = document.createElement("footer");
  const container = document.createElement("div");
  container.className = "container";

  container.innerHTML = `
    <div class="footer-content">
      <div class="footer-column">
        <h3>DSA Master</h3>
        <p>Your ultimate platform for mastering Data Structures and Algorithms in 90 days.</p>
        <div class="social-links">
          <a href="#"><i class="fab fa-github"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-linkedin"></i></a>
          <a href="#"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
      <div class="footer-column">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#" class="nav-link" data-view="home">Home</a></li>
          <li><a href="#" class="nav-link" data-view="challenges">90-Day Challenge</a></li>
          <li><a href="#" class="nav-link" data-view="docs">Documentation</a></li>
          <li><a href="#" class="nav-link" data-view="lectures">Lectures</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3>Resources</h3>
        <ul>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Cheat Sheets</a></li>
          <li><a href="#">Interview Prep</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3>Contact</h3>
        <ul>
          <li><a href="#">Support</a></li>
          <li><a href="#">Feedback</a></li>
          <li><a href="#">Report Issue</a></li>
          <li><a href="#">Suggest Feature</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} DSA Master. All rights reserved.</p>
    </div>
  `;

  footer.appendChild(container);
  return footer;
}

// Create Home View
function createHomeView() {
  const home = document.createElement("div");

  // Hero Section
  const hero = document.createElement("section");
  hero.className = "hero";
  hero.innerHTML = `
    <h1>Master Data Structures & Algorithms in 90 Days</h1>
    <p>Follow our structured learning path with daily challenges, comprehensive documentation, and interactive lectures to level up your DSA skills.</p>
    <div>
      <button class="btn nav-link" data-view="challenges">Start 90-Day Challenge</button>
      <button class="btn btn-outline nav-link" data-view="docs">Explore Documentation</button>
    </div>
  `;

  // Features Section
  const features = document.createElement("section");
  features.innerHTML = `
    <h2 class="section-title">Why Choose DSA Master?</h2>
    <div class="grid">
      <div class="card">
        <i class="fas fa-calendar-alt fa-2x" style="color: var(--primary-color); margin-bottom: 1rem;"></i>
        <h3>Structured 90-Day Challenge</h3>
        <p>Follow our carefully crafted 90-day roadmap designed to build your skills from basics to advanced concepts.</p>
      </div>
      <div class="card">
        <i class="fas fa-book fa-2x" style="color: var(--primary-color); margin-bottom: 1rem;"></i>
        <h3>Comprehensive Documentation</h3>
        <p>Access detailed explanations of data structures, algorithms, time complexities, and implementation details.</p>
      </div>
      <div class="card">
        <i class="fas fa-video fa-2x" style="color: var(--primary-color); margin-bottom: 1rem;"></i>
        <h3>Interactive Lectures</h3>
        <p>Learn through carefully structured video lectures and visualizations that simplify complex concepts.</p>
      </div>
      <div class="card">
        <i class="fas fa-code fa-2x" style="color: var(--primary-color); margin-bottom: 1rem;"></i>
        <h3>Practice Problems</h3>
        <p>Solve carefully selected problems that reinforce your understanding and prepare you for interviews.</p>
      </div>
    </div>
  `;

  // Progress Section (only show if user has started)
  if (completedDays.length > 0) {
    const progress = document.createElement("section");
    progress.innerHTML = `
      <h2 class="section-title">Your Progress</h2>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${
          (completedDays.length / 90) * 100
        }%"></div>
      </div>
      <p>${completedDays.length} of 90 days completed (${Math.round(
      (completedDays.length / 90) * 100
    )}%)</p>
      <div style="margin-top: 1rem;">
        <button class="btn nav-link" data-view="day" data-day="${currentDay}">Continue Day ${currentDay}</button>
      </div>
    `;
    home.appendChild(progress);
  }

  // Topics Preview Section
  const topicsPreview = document.createElement("section");
  topicsPreview.innerHTML = `
    <h2 class="section-title">Topics You'll Master</h2>
    <div class="topic-nav">
      <ul class="topic-list">
        <li><a href="#" data-topic="arrays">Arrays</a></li>
        <li><a href="#" data-topic="linked-lists">Linked Lists</a></li>
        <li><a href="#" data-topic="stacks">Stacks</a></li>
        <li><a href="#" data-topic="queues">Queues</a></li>
        <li><a href="#" data-topic="hash-tables">Hash Tables</a></li>
        <li><a href="#" data-topic="trees">Trees</a></li>
        <li><a href="#" data-topic="heaps">Heaps</a></li>
        <li><a href="#" data-topic="graphs">Graphs</a></li>
        <li><a href="#" data-topic="sorting">Sorting</a></li>
        <li><a href="#" data-topic="searching">Searching</a></li>
        <li><a href="#" data-topic="dynamic-programming">Dynamic Programming</a></li>
        <li><a href="#" data-topic="greedy">Greedy Algorithms</a></li>
      </ul>
    </div>
  `;

  // Testimonials Section
  const testimonials = document.createElement("section");
  testimonials.innerHTML = `
    <h2 class="section-title">What Our Students Say</h2>
    <div class="grid">
      <div class="card">
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
            <i class="fas fa-user"></i>
          </div>
          <div>
            <h3 style="margin: 0;">Sarah Johnson</h3>
            <p style="margin: 0; color: var(--text-secondary);">Software Engineer</p>
          </div>
        </div>
        <p>"This 90-day challenge was exactly what I needed to prepare for my technical interviews. The structured approach helped me build confidence in my problem-solving skills."</p>
      </div>
      <div class="card">
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
            <i class="fas fa-user"></i>
          </div>
          <div>
            <h3 style="margin: 0;">Michael Chen</h3>
            <p style="margin: 0; color: var(--text-secondary);">CS Student</p>
          </div>
        </div>
        <p>"The documentation and lectures complemented each other perfectly. I went from struggling with basic algorithms to implementing complex data structures with confidence."</p>
      </div>
      <div class="card">
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
            <i class="fas fa-user"></i>
          </div>
          <div>
            <h3 style="margin: 0;">Alex Rodriguez</h3>
            <p style="margin: 0; color: var(--text-secondary);">Full-Stack Developer</p>
          </div>
        </div>
        <p>"I've tried many DSA resources before, but the way concepts are explained here made everything click. The daily challenges kept me accountable and consistent."</p>
      </div>
    </div>
  `;

  // Call to Action
  const cta = document.createElement("section");
  cta.innerHTML = `
    <div style="text-align: center; padding: 3rem 0;">
      <h2>Ready to Start Your DSA Journey?</h2>
      <p style="max-width: 600px; margin: 1rem auto;">Join thousands of developers who have transformed their problem-solving skills with our structured 90-day challenge.</p>
      <button class="btn nav-link" data-view="challenges" style="margin-top: 1rem;">Begin Your 90-Day Challenge</button>
    </div>
  `;

  // Append all sections
  home.appendChild(hero);
  home.appendChild(features);
  home.appendChild(topicsPreview);
  home.appendChild(testimonials);
  home.appendChild(cta);

  return home;
}

// Create Challenges View
function createChallengesView() {
  const challenges = document.createElement("div");

  // Header section
  const header = document.createElement("section");
  header.innerHTML = `
    <h1 class="section-title">90-Day DSA Challenge</h1>
    <p>Track your progress through our structured 90-day Data Structures and Algorithms challenge. Each day focuses on specific topics with increasing difficulty.</p>

    <div class="progress-container">
      <div class="progress-bar" style="width: ${
        (completedDays.length / 90) * 100
      }%"></div>
    </div>
    <p>${completedDays.length} of 90 days completed (${Math.round(
    (completedDays.length / 90) * 100
  )}%)</p>
  `;

  // Days grid
  const daysSection = document.createElement("section");
  daysSection.innerHTML = `<h2 class="section-title">Challenge Days</h2>`;

  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  // Generate day items
  for (let i = 1; i <= 90; i++) {
    const dayItem = document.createElement("div");
    dayItem.className = "day-item";
    dayItem.dataset.day = i;
    dayItem.textContent = i;

    // Add completed class if day is completed
    if (completedDays.includes(i)) {
      dayItem.classList.add("completed");
    }

    // Add active class for current day
    if (i === currentDay) {
      dayItem.classList.add("active");
    }

    // Add click event to navigate to the day content
    dayItem.addEventListener("click", () => {
      loadDayContent(i);
    });

    daysGrid.appendChild(dayItem);
  }

  daysSection.appendChild(daysGrid);

  // Current day preview
  const currentDayPreview = document.createElement("section");
  currentDayPreview.innerHTML = `
    <h2 class="section-title">Day ${currentDay} Preview</h2>
    <div class="card">
      <div class="day-number">Day ${currentDay}</div>
      <h3 class="day-title">${getDayTitle(currentDay)}</h3>
      <p class="day-description">${getDayDescription(currentDay)}</p>
      <div class="difficulty ${getDayDifficulty(currentDay)}">${
    getDayDifficulty(currentDay).charAt(0).toUpperCase() +
    getDayDifficulty(currentDay).slice(1)
  }</div>
      <button class="btn" style="margin-top: 1rem;" data-day="${currentDay}">Start Day ${currentDay}</button>
    </div>
  `;

  // Append all sections
  challenges.appendChild(header);
  challenges.appendChild(daysSection);
  challenges.appendChild(currentDayPreview);

  // Week breakdown (optional)
  const weekBreakdown = document.createElement("section");
  weekBreakdown.innerHTML = `
    <h2 class="section-title">Challenge Breakdown</h2>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));">
      <div class="card">
        <h3>Week 1-2: Fundamentals</h3>
        <p>Arrays, Strings, Basic Sorting, Time & Space Complexity</p>
      </div>
      <div class="card">
        <h3>Week 3-4: Linear Data Structures</h3>
        <p>Linked Lists, Stacks, Queues, Hash Tables</p>
      </div>
      <div class="card">
        <h3>Week 5-6: Non-Linear Data Structures</h3>
        <p>Trees, Heaps, Graphs, Advanced Sorting</p>
      </div>
      <div class="card">
        <h3>Week 7-8: Algorithms I</h3>
        <p>Searching, Recursion, Divide & Conquer, Greedy Algorithms</p>
      </div>
      <div class="card">
        <h3>Week 9-10: Algorithms II</h3>
        <p>Dynamic Programming, Backtracking, Graph Algorithms</p>
      </div>
      <div class="card">
        <h3>Week 11-12: Advanced Topics</h3>
        <p>Advanced Data Structures, System Design, Practical Applications</p>
      </div>
      <div class="card">
        <h3>Week 13: Review Week</h3>
        <p>Comprehensive review of all topics, Mock Interviews</p>
      </div>
    </div>
  `;

  challenges.appendChild(weekBreakdown);

  return challenges;
}

// Create Documentation View
function createDocsView() {
  const docs = document.createElement("div");

  // Header section
  const header = document.createElement("section");
  header.innerHTML = `
    <h1 class="section-title">DSA Documentation</h1>
    <p>Comprehensive reference for data structures and algorithms. Select a topic to explore detailed explanations, implementations, and complexity analysis.</p>
  `;

  // Create documentation container with sidebar and content
  const docsContainer = document.createElement("div");
  docsContainer.className = "lecture-container";

  // Sidebar with topics
  const sidebar = document.createElement("div");
  sidebar.className = "lecture-sidebar";
  sidebar.innerHTML = `
    <div class="lecture-nav-title">Data Structures</div>
    <ul class="lecture-nav">
      <li><a href="#" class="active" data-topic="arrays">Arrays</a></li>
      <li><a href="#" data-topic="linked-lists">Linked Lists</a></li>
      <li><a href="#" data-topic="stacks">Stacks</a></li>
      <li><a href="#" data-topic="queues">Queues</a></li>
      <li><a href="#" data-topic="hash-tables">Hash Tables</a></li>
      <li><a href="#" data-topic="trees">Trees</a></li>
      <li><a href="#" data-topic="binary-search-trees">Binary Search Trees</a></li>
      <li><a href="#" data-topic="heaps">Heaps</a></li>
      <li><a href="#" data-topic="graphs">Graphs</a></li>
    </ul>
    <div class="lecture-nav-title">Algorithms</div>
    <ul class="lecture-nav">
      <li><a href="#" data-topic="sorting">Sorting Algorithms</a></li>
      <li><a href="#" data-topic="searching">Searching Algorithms</a></li>
      <li><a href="#" data-topic="recursion">Recursion</a></li>
      <li><a href="#" data-topic="dynamic-programming">Dynamic Programming</a></li>
      <li><a href="#" data-topic="greedy">Greedy Algorithms</a></li>
      <li><a href="#" data-topic="backtracking">Backtracking</a></li>
      <li><a href="#" data-topic="divide-and-conquer">Divide and Conquer</a></li>
    </ul>
    <div class="lecture-nav-title">Concepts</div>
    <ul class="lecture-nav">
      <li><a href="#" data-topic="complexity">Time & Space Complexity</a></li>
      <li><a href="#" data-topic="asymptotic-notation">Asymptotic Notation</a></li>
      <li><a href="#" data-topic="problem-solving">Problem Solving Strategies</a></li>
      <li><a href="#" data-topic="optimization">Optimization Techniques</a></li>
    </ul>
  `;

  // Content area
  const content = document.createElement("div");
  content.className = "lecture-content";
  content.innerHTML = getTopicContent("arrays"); // Default to arrays

  docsContainer.appendChild(sidebar);
  docsContainer.appendChild(content);

  // Append all sections
  docs.appendChild(header);
  docs.appendChild(docsContainer);

  return docs;
}

// Get content for a specific topic
function getTopicContent(topicId) {
  // This would ideally come from a database or API
  switch (topicId) {
    case "arrays":
      return `
        <h1 class="lecture-title">Arrays</h1>
        <div class="lecture-text">
          <p>An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.</p>

          <h2>Key Characteristics</h2>
          <ul>
            <li><strong>Random Access:</strong> Elements can be accessed directly using their index (O(1) time)</li>
            <li><strong>Fixed Size:</strong> In many languages, arrays have a fixed size (though dynamic arrays exist)</li>
            <li><strong>Homogeneous Elements:</strong> All elements in an array are of the same data type</li>
            <li><strong>Contiguous Memory:</strong> Elements are stored in adjacent memory locations</li>
          </ul>

          <h2>Common Operations</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <thead>
              <tr style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 0.75rem; text-align: left;">Operation</th>
                <th style="padding: 0.75rem; text-align: left;">Time Complexity</th>
                <th style="padding: 0.75rem; text-align: left;">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Access</td>
                <td style="padding: 0.75rem;">O(1)</td>
                <td style="padding: 0.75rem;">Get element at specific index</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Search</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Find element in unsorted array</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Insert</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Add element at specific index (requires shifting)</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Delete</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Remove element (requires shifting)</td>
              </tr>
            </tbody>
          </table>

          <h2>Implementation</h2>
          <p>Here's a basic implementation of common array operations in JavaScript:</p>

          <pre><code>// Creating an array
const arr = [1, 2, 3, 4, 5];

// Accessing elements
const firstElement = arr[0]; // 1
const lastElement = arr[arr.length - 1]; // 5

// Inserting an element
arr.push(6); // Add to end: [1, 2, 3, 4, 5, 6]
arr.unshift(0); // Add to beginning: [0, 1, 2, 3, 4, 5, 6]
arr.splice(3, 0, 2.5); // Insert at specific index: [0, 1, 2, 2.5, 3, 4, 5, 6]

// Deleting an element
arr.pop(); // Remove from end: [0, 1, 2, 2.5, 3, 4, 5]
arr.shift(); // Remove from beginning: [1, 2, 2.5, 3, 4, 5]
arr.splice(2, 1); // Remove at specific index: [1, 2, 3, 4, 5]

// Searching for an element
const index = arr.indexOf(3); // 2

// Iterating through an array
arr.forEach(item => console.log(item));

// Mapping, filtering, reducing
const doubled = arr.map(item => item * 2); // [2, 4, 6, 8, 10]
const evens = arr.filter(item => item % 2 === 0); // [2, 4]
const sum = arr.reduce((total, current) => total + current, 0); // 15</code></pre>

          <h2>Common Array Techniques</h2>

          <h3>Two Pointer Technique</h3>
          <p>Using two pointers to solve array problems efficiently, often reducing the time complexity from O(n²) to O(n).</p>
          <pre><code>// Example: Find pair that sums to target in sorted array
function findPair(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        const sum = arr[left] + arr[right];

        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return [-1, -1]; // Pair not found
}</code></pre>

          <h3>Sliding Window</h3>
          <p>Efficiently processing subarrays by maintaining a "window" that slides through the array.</p>
          <pre><code>// Example: Find max sum subarray of size k
function maxSubarraySum(arr, k) {
    if (arr.length < k) return null;

    let maxSum = 0;
    let windowSum = 0;

    // First window sum
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }

    maxSum = windowSum;

    // Slide window and update max
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }

    return maxSum;
}</code></pre>

          <h3>Prefix Sum</h3>
          <p>Precomputing cumulative sums to efficiently answer range sum queries.</p>
          <pre><code>// Example: Calculate range sum queries
function createPrefixSum(arr) {
    const prefixSum = [0];

    for (let i = 0; i < arr.length; i++) {
        prefixSum[i + 1] = prefixSum[i] + arr[i];
    }

    return prefixSum;
}

// Sum from index start to end (inclusive)
function rangeSum(prefixSum, start, end) {
    return prefixSum[end + 1] - prefixSum[start];
}</code></pre>

          <h2>Common Array Problems</h2>
          <ul>
            <li>Two Sum</li>
            <li>Three Sum</li>
            <li>Maximum Subarray</li>
            <li>Merge Sorted Arrays</li>
            <li>Product of Array Except Self</li>
            <li>Container With Most Water</li>
            <li>Trapping Rain Water</li>
          </ul>

          <h2>Advantages & Disadvantages</h2>

          <h3>Advantages</h3>
          <ul>
            <li>Simple and easy to use</li>
            <li>Random access in O(1) time</li>
            <li>Memory efficient (elements stored contiguously)</li>
            <li>Cache friendly due to memory locality</li>
          </ul>

          <h3>Disadvantages</h3>
          <ul>
            <li>Fixed size in many languages</li>
            <li>Insertion and deletion operations are expensive (O(n))</li>
            <li>Memory wastage if allocated size is more than needed</li>
            <li>Cannot store elements of different data types (in statically typed languages)</li>
          </ul>
        </div>
      `;
    case "linked-lists":
      return `
        <h1 class="lecture-title">Linked Lists</h1>
        <div class="lecture-text">
          <p>A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference to the next node in the sequence.</p>

          <h2>Key Characteristics</h2>
          <ul>
            <li><strong>Dynamic Size:</strong> Can grow or shrink during execution</li>
            <li><strong>Non-contiguous Memory:</strong> Nodes can be stored anywhere in memory</li>
            <li><strong>Sequential Access:</strong> Elements must be accessed sequentially starting from the head</li>
            <li><strong>No Random Access:</strong> Cannot directly access elements by index in O(1) time</li>
          </ul>

          <h2>Types of Linked Lists</h2>
          <ul>
            <li><strong>Singly Linked List:</strong> Each node points to the next node</li>
            <li><strong>Doubly Linked List:</strong> Each node points to both the next and previous nodes</li>
            <li><strong>Circular Linked List:</strong> Last node points back to the first node, forming a circle</li>
          </ul>

          <h2>Common Operations</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <thead>
              <tr style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 0.75rem; text-align: left;">Operation</th>
                <th style="padding: 0.75rem; text-align: left;">Time Complexity</th>
                <th style="padding: 0.75rem; text-align: left;">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Access</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Traverse from head to find element</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Search</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Traverse to find element</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Insert at beginning</td>
                <td style="padding: 0.75rem;">O(1)</td>
                <td style="padding: 0.75rem;">Add node at head</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Insert at end</td>
                <td style="padding: 0.75rem;">O(n) or O(1)*</td>
                <td style="padding: 0.75rem;">Add node at tail (*O(1) if tail pointer is maintained)</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Delete at beginning</td>
                <td style="padding: 0.75rem;">O(1)</td>
                <td style="padding: 0.75rem;">Remove head node</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem;">Delete at end</td>
                <td style="padding: 0.75rem;">O(n)</td>
                <td style="padding: 0.75rem;">Traverse to find and remove tail</td>
              </tr>
            </tbody>
          </table>

          <h2>Basic Implementation</h2>
          <p>Here's a basic implementation of a singly linked list in JavaScript:</p>

          <pre><code>class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    // Add a node to the end
    append(data) {
        const newNode = new Node(data);

        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }

        this.size++;
    }

    // Add a node to the beginning
    prepend(data) {
        const newNode = new Node(data);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
    }

    // Insert at specific position
    insertAt(data, index) {
        if (index < 0 || index > this.size) {
            return false;
        }

        if (index === 0) {
            this.prepend(data);
            return true;
        }

        const newNode = new Node(data);
        let current = this.head;
        let previous = null;
        let count = 0;

        while (count < index) {
            previous = current;
            current = current.next;
            count++;
        }

        newNode.next = current;
        previous.next = newNode;
        this.size++;
        return true;
    }

    // Remove from specific position
    removeAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }

        let current = this.head;
        let previous = null;
        let count = 0;

        if (index === 0) {
            this.head = current.next;
        } else {
            while (count < index) {
                previous = current;
                current = current.next;
                count++;
            }
            previous.next = current.next;
        }

        this.size--;
        return current.data;
    }

    // Get data at specific index
    getAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }

        let current = this.head;
        let count = 0;

        while (count < index) {
            current = current.next;
            count++;
        }

        return current.data;
    }

    // Print the list
    printList() {
        let current = this.head;
        let result = '';

        while (current) {
            result += current.data + ' -> ';
            current = current.next;
        }

        return result + 'null';
    }
}</code></pre>

          <h2>Common Linked List Techniques</h2>

          <h3>Fast & Slow Pointers (Floyd's Cycle Finding Algorithm)</h3>
          <p>Using two pointers that move at different speeds to solve problems like detecting cycles.</p>
          <pre><code>// Detect cycle in a linked list
function hasCycle(head) {
    if (!head || !head.next) return false;

    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;       // Move one step
        fast = fast.next.next;  // Move two steps

        if (slow === fast) {
            return true;  // Cycle detected
        }
    }

    return false;  // No cycle
}</code></pre>

          <h3>Reversing a Linked List</h3>
          <p>A fundamental technique for manipulating linked lists.</p>
          <pre><code>// Reverse a linked list
function reverseList(head) {
    let prev = null;
    let current = head;

    while (current) {
        const next = current.next;  // Store next node
        current.next = prev;        // Reverse the pointer
        prev = current;             // Move prev forward
        current = next;             // Move current forward
    }

    return prev;  // New head
}</code></pre>

          <h2>Advantages & Disadvantages</h2>

          <h3>Advantages</h3>
          <ul>
            <li>Dynamic size - can grow or shrink at runtime</li>
            <li>Efficient insertions and deletions at the beginning (O(1))</li>
            <li>No need to pre-allocate memory</li>
            <li>Efficient memory utilization (only allocate what's needed)</li>
          </ul>

          <h3>Disadvantages</h3>
          <ul>
            <li>No random access - must traverse from beginning to access elements (O(n))</li>
            <li>Extra memory for storing pointers</li>
            <li>Not cache-friendly due to non-contiguous memory allocation</li>
            <li>Reverse traversal is difficult in singly linked lists</li>
          </ul>

          <h2>Common Linked List Problems</h2>
          <ul>
            <li>Reverse a Linked List</li>
            <li>Detect Cycle in a Linked List</li>
            <li>Find Middle of Linked List</li>
            <li>Merge Two Sorted Lists</li>
            <li>Remove Nth Node From End</li>
            <li>Intersection of Two Linked Lists</li>
            <li>Palindrome Linked List</li>
          </ul>
        </div>
      `;
    default:
      return `
        <h1 class="lecture-title">${
          topicId.charAt(0).toUpperCase() + topicId.slice(1).replace(/-/g, " ")
        }</h1>
        <div class="lecture-text">
          <div class="loading">
            <p>Content for this topic is being developed. Check back soon!</p>
          </div>
        </div>
      `;
  }
}

// Create Lectures View
function createLecturesView() {
  const lectures = document.createElement("div");

  // Header section
  const header = document.createElement("section");
  header.innerHTML = `
    <h1 class="section-title">DSA Lectures</h1>
    <p>Interactive video lectures to help you master data structures and algorithms. Each lecture includes visualizations, code examples, and practice problems.</p>
  `;

  // Topic filters
  const topicFilters = document.createElement("section");
  topicFilters.innerHTML = `
    <div class="topic-nav">
      <ul class="topic-list">
        <li><a href="#" class="active" data-topic-filter="all">All Lectures</a></li>
        <li><a href="#" data-topic-filter="fundamentals">Fundamentals</a></li>
        <li><a href="#" data-topic-filter="data-structures">Data Structures</a></li>
        <li><a href="#" data-topic-filter="algorithms">Algorithms</a></li>
        <li><a href="#" data-topic-filter="advanced">Advanced Topics</a></li>
      </ul>
    </div>
  `;

  // Lectures grid
  const lecturesGrid = document.createElement("section");
  lecturesGrid.innerHTML = `
    <div class="grid">
      ${getLectures()
        .map((lecture) => createLectureCard(lecture))
        .join("")}
    </div>
  `;

  // Append all sections
  lectures.appendChild(header);
  lectures.appendChild(topicFilters);
  lectures.appendChild(lecturesGrid);

  return lectures;
}

// Helper function to create a lecture card
function createLectureCard(lecture) {
  return `
    <div class="card dsa-day-card" data-topic="${lecture.topic}">
      <div style="position: relative; width: 100%; padding-top: 56.25%; margin-bottom: 1rem; background-color: var(--bg-secondary); border-radius: 0.25rem; overflow: hidden;">
        <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; color: var(--primary-color); opacity: 0.8;"></i>
      </div>
      <h3 class="day-title">${lecture.title}</h3>
      <p class="day-description">${lecture.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
        <div class="difficulty ${lecture.level.toLowerCase()}">${
    lecture.level
  }</div>
        <div style="color: var(--text-secondary); font-size: 0.875rem;">${
          lecture.duration
        }</div>
      </div>
    </div>
  `;
}

// Get lectures data
function getLectures() {
  // This would ideally come from a database or API
  return [
    {
      id: 1,
      title: "Introduction to Big O Notation",
      description:
        "Learn how to analyze algorithm efficiency using Big O notation.",
      level: "Easy",
      duration: "15 mins",
      topic: "fundamentals",
    },
    {
      id: 2,
      title: "Arrays and Array Operations",
      description: "Deep dive into array data structure and common operations.",
      level: "Easy",
      duration: "22 mins",
      topic: "data-structures",
    },
    {
      id: 3,
      title: "Linked Lists Fundamentals",
      description:
        "Understanding singly and doubly linked lists with examples.",
      level: "Medium",
      duration: "25 mins",
      topic: "data-structures",
    },
    {
      id: 4,
      title: "Stacks and Queues",
      description:
        "Implementation and applications of stack and queue data structures.",
      level: "Medium",
      duration: "20 mins",
      topic: "data-structures",
    },
    {
      id: 5,
      title: "Hash Tables and Hashing Techniques",
      description:
        "Learn how hash tables work and different collision resolution strategies.",
      level: "Medium",
      duration: "28 mins",
      topic: "data-structures",
    },
    {
      id: 6,
      title: "Binary Search Trees",
      description:
        "Understanding tree data structures with focus on binary search trees.",
      level: "Hard",
      duration: "32 mins",
      topic: "data-structures",
    },
    {
      id: 7,
      title: "Graph Representation and Traversals",
      description:
        "Learn about adjacency lists, matrices, BFS and DFS traversals.",
      level: "Hard",
      duration: "35 mins",
      topic: "data-structures",
    },
    {
      id: 8,
      title: "Sorting Algorithms: Part 1",
      description: "Bubble sort, selection sort, and insertion sort explained.",
      level: "Medium",
      duration: "27 mins",
      topic: "algorithms",
    },
    {
      id: 9,
      title: "Sorting Algorithms: Part 2",
      description: "Merge sort, quick sort, and heap sort with demonstrations.",
      level: "Hard",
      duration: "30 mins",
      topic: "algorithms",
    },
    {
      id: 10,
      title: "Dynamic Programming: Introduction",
      description:
        "Learn the fundamentals of dynamic programming with simple examples.",
      level: "Hard",
      duration: "40 mins",
      topic: "advanced",
    },
    {
      id: 11,
      title: "Backtracking Algorithms",
      description:
        "Understanding backtracking with problems like N-Queens and Sudoku.",
      level: "Hard",
      duration: "38 mins",
      topic: "advanced",
    },
    {
      id: 12,
      title: "Two Pointer Technique",
      description:
        "Solving array problems efficiently using two pointers approach.",
      level: "Medium",
      duration: "18 mins",
      topic: "algorithms",
    },
  ];
}

// Create Day View
function createDayView(day) {
  const dayView = document.createElement("div");

  // Header with day info
  const header = document.createElement("section");
  header.innerHTML = `
    <div class="problem-header">
      <div>
        <h1 class="section-title">Day ${day}: ${getDayTitle(day)}</h1>
        <div class="problem-details">
          <div class="difficulty ${getDayDifficulty(day)}">${
    getDayDifficulty(day).charAt(0).toUpperCase() +
    getDayDifficulty(day).slice(1)
  }</div>
          <div class="problem-tag">Day ${day}/90</div>
          <div class="problem-tag">${getTopicTags(day).join(
            '</div><div class="problem-tag">'
          )}</div>
        </div>
      </div>
      <button id="mark-complete" class="btn ${
        completedDays.includes(day) ? "btn-secondary" : ""
      }">
        ${completedDays.includes(day) ? "Completed ✓" : "Mark as Complete"}
      </button>
    </div>
  `;

  // Problem description
  const description = document.createElement("section");
  description.className = "problem-description";
  description.innerHTML = `
    <div class="card">
      <h2>Overview</h2>
      <p>${getDayDescription(day)}</p>

      <h2>Learning Objectives</h2>
      <ul>
        ${getLearningObjectives(day)
          .map((obj) => `<li>${obj}</li>`)
          .join("")}
      </ul>
    </div>
  `;

  // Theory section
  const theory = document.createElement("section");
  theory.innerHTML = `
    <h2 class="section-title">Theory</h2>
    <div class="card lecture-text">
      ${getDayTheory(day)}
    </div>
  `;

  // Code examples section with event listeners for tabs
  const codeExamples = document.createElement("section");
  codeExamples.innerHTML = `
    <h2 class="section-title">Code Examples</h2>
    <div class="card">
      <div class="solution-tabs">
        <div class="solution-tab active" data-language="javascript">JavaScript</div>
        <div class="solution-tab" data-language="python">Python</div>
        <div class="solution-tab" data-language="java">Java</div>
        <div class="solution-tab" data-language="cpp">C++</div>
      </div>
      <div class="solution-content">
        <pre><code>${getDayCodeExample(day, "javascript")}</code></pre>
      </div>
    </div>
  `;

  // Practice problems section
  const practice = document.createElement("section");
  practice.innerHTML = `
    <h2 class="section-title">Practice Problems</h2>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));">
      ${getDayProblems(day)
        .map(
          (problem) => `
        <div class="card">
          <h3>${problem.title}</h3>
          <p>${problem.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <div class="difficulty ${problem.difficulty.toLowerCase()}">${
            problem.difficulty
          }</div>
            <button class="btn btn-outline solve-problem-btn">Solve Problem</button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  // Additional resources section
  const resources = document.createElement("section");
  resources.innerHTML = `
    <h2 class="section-title">Additional Resources</h2>
    <div class="card">
      <h3>Related Lectures</h3>
      <ul>
        ${getRelatedLectures(day)
          .map(
            (lecture) =>
              `<li><a href="#" class="resource-link">${lecture}</a></li>`
          )
          .join("")}
      </ul>

      <h3>External Resources</h3>
      <ul>
        <li><a href="#" target="_blank" class="external-link">GeeksforGeeks: ${getDayTitle(
          day
        )}</a></li>
        <li><a href="#" target="_blank" class="external-link">Visualizing ${getDayTitle(
          day
        )
          .split(" ")
          .pop()}</a></li>
        <li><a href="#" target="_blank" class="external-link">LeetCode Problems on ${getDayTitle(
          day
        )
          .split(" ")
          .pop()}</a></li>
      </ul>
    </div>
  `;

  // Navigation buttons
  const navigation = document.createElement("section");
  navigation.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
      ${
        day > 1
          ? `<button class="btn btn-outline prev-day-btn" data-day="${
              day - 1
            }">← Previous Day</button>`
          : `<div></div>`
      }
      ${
        day < 90
          ? `<button class="btn btn-outline next-day-btn" data-day="${
              day + 1
            }">Next Day →</button>`
          : `<div></div>`
      }
    </div>
  `;

  // Append all sections
  dayView.appendChild(header);
  dayView.appendChild(description);
  dayView.appendChild(theory);
  dayView.appendChild(codeExamples);
  dayView.appendChild(practice);
  dayView.appendChild(resources);
  dayView.appendChild(navigation);

  return dayView;
}

// Helper functions for day content
function getTopicTags(day) {
  // Based on day number, return relevant topic tags
  if (day <= 8) {
    return ["Arrays", "Time Complexity"];
  } else if (day <= 16) {
    return ["Linked Lists", "Pointers"];
  } else if (day <= 24) {
    return ["Stacks", "Queues", "Hash Tables"];
  } else if (day <= 32) {
    return ["Trees", "Binary Search Trees"];
  } else if (day <= 40) {
    return ["Heaps", "Priority Queues"];
  } else if (day <= 48) {
    return ["Graphs", "Graph Algorithms"];
  } else if (day <= 56) {
    return ["Sorting", "Searching"];
  } else if (day <= 64) {
    return ["Dynamic Programming", "Memoization"];
  } else if (day <= 72) {
    return ["Greedy Algorithms", "Divide & Conquer"];
  } else if (day <= 80) {
    return ["Backtracking", "Branch & Bound"];
  } else {
    return ["Advanced Topics", "Interview Preparation"];
  }
}

function getLearningObjectives(day) {
  // Default learning objectives based on day
  const defaultObjectives = [
    "Understand the theoretical concepts related to today's topic",
    "Implement the data structure or algorithm in your preferred language",
    "Analyze the time and space complexity of the implementation",
    "Solve practice problems using the concepts learned",
  ];

  // Return custom objectives based on day if needed
  return defaultObjectives;
}

function getDayTheory(day) {
  // For demonstration purposes, return sample theory for day 1
  if (day === 1) {
    return `
      <h2>Introduction to Arrays</h2>
      <p>An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together. This makes it easier to calculate the position of each element by simply adding an offset to a base value, i.e., the memory location of the first element of the array (generally denoted by the name of the array).</p>

      <h3>Why Arrays?</h3>
      <p>Arrays allow random access to elements. This makes accessing elements by position faster. Arrays have better cache locality which makes a pretty big difference in performance.</p>

      <h3>Time Complexity</h3>
      <p>Time complexity is a concept in computer science that describes the amount of time it takes to run an algorithm. Time complexity is commonly estimated by counting the number of elementary operations performed by the algorithm, supposing that each elementary operation takes a fixed amount of time to perform.</p>

      <h3>Big O Notation</h3>
      <p>Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. In computer science, big O notation is used to classify algorithms according to how their run time or space requirements grow as the input size grows.</p>

      <h4>Common Time Complexities for Arrays</h4>
      <ul>
        <li><strong>Access:</strong> O(1) - Constant time to access any element by index</li>
        <li><strong>Search:</strong> O(n) - Linear time to find a specific element (if unsorted)</li>
        <li><strong>Insertion:</strong> O(n) - Linear time to insert (might need to shift elements)</li>
        <li><strong>Deletion:</strong> O(n) - Linear time to delete (might need to shift elements)</li>
      </ul>
    `;
  } else {
    return `
      <p>Theory content for Day ${day} will be added soon.</p>
      <p>This section will include concepts, explanations, diagrams, and theoretical background on ${getDayTitle(
        day
      )}.</p>
    `;
  }
}

function getDayCodeExample(day, language) {
  // For demonstration purposes, return a sample code example for day 1
  if (day === 1 && language === "javascript") {
    return `// Creating an array
const array = [1, 2, 3, 4, 5];

// Accessing elements
console.log("First element:", array[0]); // 1
console.log("Last element:", array[array.length - 1]); // 5

// Modifying elements
array[2] = 10; // Changes third element (index 2) to 10
console.log("Modified array:", array); // [1, 2, 10, 4, 5]

// Array operations with time complexity analysis
function findElement(arr, target) {
  // Time Complexity: O(n) - need to check each element in worst case
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Return index if found
    }
  }
  return -1; // Return -1 if not found
}

function insertAtIndex(arr, index, value) {
  // Time Complexity: O(n) - might need to shift elements
  return [...arr.slice(0, index), value, ...arr.slice(index)];
}

function removeAtIndex(arr, index) {
  // Time Complexity: O(n) - might need to shift elements
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

// Examples
console.log("Finding element 10:", findElement(array, 10)); // 2
const newArray = insertAtIndex(array, 3, 99);
console.log("After insertion:", newArray); // [1, 2, 10, 99, 4, 5]
const arrayAfterRemoval = removeAtIndex(array, 0);
console.log("After removal:", arrayAfterRemoval); // [2, 10, 4, 5]`;
  } else if (language === "python") {
    return `# Sample Python code example for Day ${day}
# This would be replaced with actual content`;
  } else if (language === "java") {
    return `// Sample Java code example for Day ${day}
// This would be replaced with actual content`;
  } else if (language === "cpp") {
    return `// Sample C++ code example for Day ${day}
// This would be replaced with actual content`;
  } else {
    return `// Code example for Day ${day} will be added soon.`;
  }
}

function getDayProblems(day) {
  // Generate sample practice problems based on the day
  const problems = [];

  // Add basic problems
  problems.push({
    title: `Problem 1: Basic ${getDayTitle(day).split(" ").pop()} Operations`,
    description: `Implement basic operations for ${getDayTitle(day)
      .split(" ")
      .pop()}.`,
    difficulty: "Easy",
  });

  // Add medium problems
  problems.push({
    title: `Problem 2: Intermediate ${getDayTitle(day)
      .split(" ")
      .pop()} Challenge`,
    description: `Solve a real-world problem using ${getDayTitle(day)
      .split(" ")
      .pop()}.`,
    difficulty: "Medium",
  });

  // Add hard problems if day is past 30
  if (day > 30) {
    problems.push({
      title: `Problem 3: Advanced ${getDayTitle(day).split(" ").pop()} Problem`,
      description:
        "Solve a complex problem that requires optimization and deep understanding.",
      difficulty: "Hard",
    });
  }

  return problems;
}

function getRelatedLectures(day) {
  // Return some sample related lectures based on the day
  const baseLectures = [
    `Introduction to ${getDayTitle(day).split(" ").pop()}`,
    `Advanced ${getDayTitle(day).split(" ").pop()} Techniques`,
    `${getDayTitle(day).split(" ").pop()} in the Real World`,
  ];

  return baseLectures;
}

// Helper functions for day title and description
function getDayTitle(day) {
  // This would ideally come from a database or API
  const titles = {
    1: "Introduction to Arrays and Time Complexity",
    2: "Array Operations and Techniques",
    3: "Two Pointer Technique with Arrays",
    4: "Prefix Sum and Sliding Window",
    5: "Introduction to Sorting Algorithms",
    6: "Binary Search",
    7: "Strings and String Manipulation",
    8: "Weekly Review and Practice Problems",
    9: "Introduction to Linked Lists",
    10: "Linked List Operations",
    // ... other days would be defined here
  };

  return titles[day] || `Day ${day} Content`;
}

function getDayDescription(day) {
  // This would ideally come from a database or API
  const descriptions = {
    1: "Learn about array data structure, basic operations, and analyzing their time complexity.",
    2: "Deep dive into array manipulation techniques including insertion, deletion, and traversal.",
    3: "Master the two pointer technique to solve array problems efficiently.",
    4: "Learn prefix sum arrays and sliding window technique for optimizing array operations.",
    5: "Introduction to basic sorting algorithms: Bubble Sort, Selection Sort, and Insertion Sort.",
    6: "Master the binary search algorithm and its applications.",
    7: "Learn string operations, pattern matching, and common string algorithms.",
    8: "Review week 1 concepts and solve integrated practice problems.",
    9: "Introduction to linked list data structure and its advantages over arrays.",
    10: "Implementation of linked list operations: insertion, deletion, and traversal.",
    // ... other days would be defined here
  };

  return (
    descriptions[day] ||
    "Detailed lesson and challenges for this day of the DSA journey."
  );
}

function getDayDifficulty(day) {
  // Determine difficulty based on day number
  if (day <= 30) {
    return "easy";
  } else if (day <= 60) {
    return "medium";
  } else {
    return "hard";
  }
}

// Filter lectures by topic
function filterLectures(filter) {
  const lectureCards = document.querySelectorAll("[data-topic]");

  lectureCards.forEach((card) => {
    const topic = card.dataset.topic;

    if (filter === "all" || topic === filter) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}
