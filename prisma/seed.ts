import {
  PrismaClient,
  UserRole,
  JobType,
  ExperienceLevel,
  JobStatus,
  ApplicationStatus,
  NotificationType,
  NotificationPriority,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Realistic data sets
const skills = {
  frontend: [
    "React",
    "Vue.js",
    "Angular",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Next.js",
    "Redux",
    "Svelte",
    "Webpack",
  ],
  backend: [
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Go",
    "Ruby",
    "PHP",
    "Django",
    "Express.js",
    "FastAPI",
    "Spring Boot",
    "Laravel",
  ],
  database: [
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "DynamoDB",
    "Cassandra",
    "Oracle",
  ],
  devops: [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
    "GitLab CI",
  ],
  mobile: [
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "iOS",
    "Android",
    "Xamarin",
  ],
  data: [
    "Machine Learning",
    "Data Analysis",
    "TensorFlow",
    "PyTorch",
    "Pandas",
    "SQL",
    "R",
    "Spark",
    "Hadoop",
  ],
  design: [
    "Figma",
    "Adobe XD",
    "Sketch",
    "UI/UX Design",
    "Wireframing",
    "Prototyping",
    "Adobe Photoshop",
  ],
  other: [
    "Git",
    "Agile",
    "Scrum",
    "REST API",
    "GraphQL",
    "Microservices",
    "Testing",
    "Security",
    "Linux",
  ],
};

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Telecommunications",
  "Automotive",
  "Retail",
  "Energy",
  "Cybersecurity",
];

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const locations = [
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Boston, MA",
  "Chicago, IL",
  "Los Angeles, CA",
  "Denver, CO",
  "Remote",
  "London, UK",
  "Berlin, Germany",
  "Toronto, Canada",
  "Singapore",
  "Karachi, Pakistan",
  "Lahore, Pakistan",
  "Islamabad, Pakistan",
  "Dubai, UAE",
  "Sydney, Australia",
  "Amsterdam, Netherlands",
];

const jobTitles = [
  "Senior Full Stack Developer",
  "Frontend Engineer",
  "Backend Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Mobile Developer",
  "Security Engineer",
  "Cloud Architect",
  "QA Engineer",
  "Technical Lead",
  "Software Architect",
  "Site Reliability Engineer",
];

// Candidate data
const candidatesData = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications",
    phone: "+14155551234",
    location: "San Francisco, CA",
    website: "https://sarahjohnson.dev",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "AWS",
      "Docker",
      "GraphQL",
      "Next.js",
    ],
    yearsOfExperience: 5,
    experienceLevel: "SENIOR" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Computer Science",
        institution: "Stanford University",
        field: "Computer Science",
        startYear: 2014,
        endYear: 2018,
      },
    ],
    workExperience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Startup Inc",
        location: "San Francisco, CA",
        startDate: "2021-03",
        current: true,
        description:
          "Leading development of core platform features using React and Node.js. Mentoring junior developers and conducting code reviews.",
      },
      {
        title: "Software Engineer",
        company: "Digital Solutions LLC",
        location: "San Francisco, CA",
        startDate: "2018-06",
        endDate: "2021-02",
        description:
          "Developed and maintained multiple web applications using modern JavaScript frameworks.",
      },
    ],
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    bio: "DevOps engineer specializing in cloud infrastructure and automation with AWS and Kubernetes",
    phone: "+14155552345",
    location: "Seattle, WA",
    website: "https://michaelchen.io",
    skills: [
      "AWS",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Python",
      "CI/CD",
      "Jenkins",
      "Linux",
    ],
    yearsOfExperience: 7,
    experienceLevel: "SENIOR" as ExperienceLevel,
    education: [
      {
        degree: "Master's in Software Engineering",
        institution: "University of Washington",
        field: "Software Engineering",
        startYear: 2013,
        endYear: 2015,
      },
    ],
    workExperience: [
      {
        title: "Senior DevOps Engineer",
        company: "Cloud Systems Corp",
        location: "Seattle, WA",
        startDate: "2019-01",
        current: true,
        description:
          "Managing cloud infrastructure for high-traffic applications. Implementing CI/CD pipelines and automation.",
      },
    ],
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    bio: "Creative UI/UX designer passionate about creating intuitive and beautiful user experiences",
    phone: "+13105553456",
    location: "Los Angeles, CA",
    website: "https://emilyrodriguez.design",
    skills: [
      "Figma",
      "Adobe XD",
      "UI/UX Design",
      "Wireframing",
      "Prototyping",
      "HTML",
      "CSS",
      "React",
    ],
    yearsOfExperience: 4,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Design",
        institution: "Art Center College of Design",
        field: "Interaction Design",
        startYear: 2016,
        endYear: 2020,
      },
    ],
    workExperience: [
      {
        title: "Senior Product Designer",
        company: "Design Studio",
        location: "Los Angeles, CA",
        startDate: "2022-05",
        current: true,
        description:
          "Leading design for multiple product initiatives. Conducting user research and usability testing.",
      },
    ],
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    bio: "Data scientist with expertise in machine learning, deep learning, and statistical analysis",
    phone: "+16465554567",
    location: "New York, NY",
    website: "https://davidkim.ai",
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Data Analysis",
      "Pandas",
      "Scikit-learn",
    ],
    yearsOfExperience: 6,
    experienceLevel: "SENIOR" as ExperienceLevel,
    education: [
      {
        degree: "Ph.D. in Data Science",
        institution: "MIT",
        field: "Data Science",
        startYear: 2015,
        endYear: 2020,
      },
    ],
    workExperience: [
      {
        title: "Lead Data Scientist",
        company: "Analytics Co",
        location: "New York, NY",
        startDate: "2020-06",
        current: true,
        description:
          "Building ML models for business intelligence. Leading data science team of 5 members.",
      },
    ],
  },
  {
    name: "Jessica Taylor",
    email: "jessica.taylor@example.com",
    bio: "Mobile developer specializing in React Native and cross-platform app development",
    phone: "+15125555678",
    location: "Austin, TX",
    website: "https://jessicataylor.app",
    skills: [
      "React Native",
      "iOS",
      "Swift",
      "JavaScript",
      "TypeScript",
      "Redux",
      "Firebase",
      "REST API",
    ],
    yearsOfExperience: 3,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Computer Engineering",
        institution: "University of Texas",
        field: "Computer Engineering",
        startYear: 2017,
        endYear: 2021,
      },
    ],
    workExperience: [
      {
        title: "Mobile Developer",
        company: "App Development Inc",
        location: "Austin, TX",
        startDate: "2021-08",
        current: true,
        description:
          "Developing cross-platform mobile applications for iOS and Android.",
      },
    ],
  },
  {
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    bio: "Full-stack developer passionate about building scalable web applications with modern technologies",
    phone: "+923001234567",
    location: "Karachi, Pakistan",
    website: "https://ahmedhassan.dev",
    skills: [
      "Next.js",
      "React",
      "Node.js",
      "PostgreSQL",
      "TypeScript",
      "Prisma",
      "Tailwind CSS",
      "AWS",
    ],
    yearsOfExperience: 4,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Software Engineering",
        institution: "NED University",
        field: "Software Engineering",
        startYear: 2016,
        endYear: 2020,
      },
    ],
    workExperience: [
      {
        title: "Full Stack Developer",
        company: "Tech Solutions Pakistan",
        location: "Karachi, Pakistan",
        startDate: "2020-07",
        current: true,
        description:
          "Building web applications using modern JavaScript frameworks and cloud services.",
      },
    ],
  },
  {
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    bio: "Junior frontend developer eager to learn and grow in web development",
    phone: "+16175556789",
    location: "Boston, MA",
    skills: ["React", "JavaScript", "HTML", "CSS", "Git", "REST API"],
    yearsOfExperience: 1,
    experienceLevel: "ENTRY" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Information Technology",
        institution: "Boston University",
        field: "Information Technology",
        startYear: 2019,
        endYear: 2023,
      },
    ],
    workExperience: [
      {
        title: "Frontend Developer",
        company: "Web Agency",
        location: "Boston, MA",
        startDate: "2023-06",
        current: true,
        description:
          "Building responsive web interfaces and learning modern frameworks.",
      },
    ],
  },
  {
    name: "Robert Martinez",
    email: "robert.martinez@example.com",
    bio: "Backend engineer with strong database and API development expertise",
    phone: "+13125557890",
    location: "Chicago, IL",
    skills: [
      "Python",
      "Django",
      "PostgreSQL",
      "Redis",
      "REST API",
      "Docker",
      "AWS",
    ],
    yearsOfExperience: 5,
    experienceLevel: "SENIOR" as ExperienceLevel,
    education: [
      {
        degree: "Master's in Computer Science",
        institution: "University of Illinois",
        field: "Computer Science",
        startYear: 2014,
        endYear: 2016,
      },
    ],
    workExperience: [
      {
        title: "Senior Backend Engineer",
        company: "E-commerce Platform",
        location: "Chicago, IL",
        startDate: "2019-03",
        current: true,
        description:
          "Architecting scalable backend systems for high-traffic e-commerce platform.",
      },
    ],
  },
  {
    name: "Sophia Lee",
    email: "sophia.lee@example.com",
    bio: "Cloud architect with expertise in AWS and Azure infrastructure design",
    phone: "+14085558901",
    location: "Remote",
    skills: [
      "AWS",
      "Azure",
      "Terraform",
      "Kubernetes",
      "Docker",
      "Python",
      "Microservices",
    ],
    yearsOfExperience: 8,
    experienceLevel: "EXECUTIVE" as ExperienceLevel,
    education: [
      {
        degree: "Bachelor's in Computer Science",
        institution: "UC Berkeley",
        field: "Computer Science",
        startYear: 2010,
        endYear: 2014,
      },
    ],
    workExperience: [
      {
        title: "Cloud Solutions Architect",
        company: "Cloud Consulting Firm",
        location: "Remote",
        startDate: "2018-01",
        current: true,
        description:
          "Designing cloud infrastructure solutions for enterprise clients.",
      },
    ],
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    bio: "Security engineer focused on application security and penetration testing",
    phone: "+12125559012",
    location: "New York, NY",
    skills: [
      "Security",
      "Python",
      "Penetration Testing",
      "OWASP",
      "Linux",
      "Network Security",
    ],
    yearsOfExperience: 6,
    experienceLevel: "SENIOR" as ExperienceLevel,
    education: [
      {
        degree: "Master's in Cybersecurity",
        institution: "NYU",
        field: "Cybersecurity",
        startYear: 2015,
        endYear: 2017,
      },
    ],
    workExperience: [
      {
        title: "Senior Security Engineer",
        company: "Cybersecurity Firm",
        location: "New York, NY",
        startDate: "2020-01",
        current: true,
        description:
          "Conducting security audits and implementing security best practices.",
      },
    ],
  },
];

// Company data
const companiesData = [
  {
    name: "John Smith",
    email: "john@techcorp.com",
    companyName: "TechCorp Solutions",
    bio: "Leading technology solutions provider for enterprise clients",
    phone: "+14155559999",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    companySize: "201-500",
    industry: "Technology",
    description:
      "TechCorp Solutions is a leading provider of innovative technology solutions for enterprises worldwide. We specialize in cloud computing, AI, and digital transformation services.",
    foundedYear: 2015,
    headquarters: "San Francisco, CA",
  },
  {
    name: "Lisa Anderson",
    email: "lisa@innovatestartup.com",
    companyName: "Innovate Startup",
    bio: "Fast-growing fintech startup disrupting the industry",
    phone: "+16465558888",
    location: "New York, NY",
    website: "https://innovatestartup.com",
    companySize: "11-50",
    industry: "Finance",
    description:
      "Innovate Startup is revolutionizing the way people interact with financial services through cutting-edge technology and user-centric design.",
    foundedYear: 2020,
    headquarters: "New York, NY",
  },
  {
    name: "Mark Wilson",
    email: "mark@digitalhealth.com",
    companyName: "Digital Health Inc",
    bio: "Transforming healthcare through innovative technology solutions",
    phone: "+12065557777",
    location: "Seattle, WA",
    website: "https://digitalhealth.com",
    companySize: "51-200",
    industry: "Healthcare",
    description:
      "Digital Health Inc is on a mission to make healthcare more accessible and efficient through innovative digital solutions and telemedicine platforms.",
    foundedYear: 2018,
    headquarters: "Seattle, WA",
  },
  {
    name: "Sarah Green",
    email: "sarah@edutech.com",
    companyName: "EduTech Platform",
    bio: "Making quality education accessible to everyone worldwide",
    phone: "+15125556666",
    location: "Austin, TX",
    website: "https://edutech.com",
    companySize: "101-200",
    industry: "Education",
    description:
      "EduTech Platform provides cutting-edge online learning solutions to students and professionals worldwide, featuring AI-powered personalized learning paths.",
    foundedYear: 2017,
    headquarters: "Austin, TX",
  },
  {
    name: "Ali Khan",
    email: "ali@paktech.com",
    companyName: "PakTech Solutions",
    bio: "Leading software development company in South Asia",
    phone: "+923211234567",
    location: "Lahore, Pakistan",
    website: "https://paktech.com",
    companySize: "51-200",
    industry: "Technology",
    description:
      "PakTech Solutions is a premier software development company offering web, mobile, and cloud solutions to global clients with a focus on quality and innovation.",
    foundedYear: 2016,
    headquarters: "Lahore, Pakistan",
  },
  {
    name: "Jennifer Davis",
    email: "jennifer@cloudnative.com",
    companyName: "CloudNative Systems",
    bio: "Cloud-first software development and consulting",
    phone: "+14085555555",
    location: "Remote",
    website: "https://cloudnative.com",
    companySize: "11-50",
    industry: "Technology",
    description:
      "CloudNative Systems helps companies migrate to cloud infrastructure and build cloud-native applications with modern architectures.",
    foundedYear: 2019,
    headquarters: "San Jose, CA",
  },
  {
    name: "David Brown",
    email: "david@ecommgiant.com",
    companyName: "E-Commerce Giant",
    bio: "Next-generation e-commerce platform",
    phone: "+13105554444",
    location: "Los Angeles, CA",
    website: "https://ecommgiant.com",
    companySize: "501-1000",
    industry: "E-commerce",
    description:
      "E-Commerce Giant is building the future of online shopping with AI-powered recommendations and seamless checkout experiences.",
    foundedYear: 2014,
    headquarters: "Los Angeles, CA",
  },
];

// Job templates
const jobDescriptions = [
  {
    title: "Senior Full Stack Developer",
    description:
      "We are looking for an experienced Full Stack Developer to join our engineering team. You will work on building scalable web applications using modern technologies including React, Node.js, and cloud platforms. The ideal candidate has strong experience with both frontend and backend development and can work independently.",
    requirements:
      "Required: 5+ years of experience with React and Node.js, Strong understanding of TypeScript, Experience with PostgreSQL or similar databases, Knowledge of AWS or Azure, Excellent problem-solving skills, Experience with Git and CI/CD pipelines",
    responsibilities:
      "Design and develop full-stack web applications, Write clean, maintainable, and testable code, Collaborate with cross-functional teams including designers and product managers, Participate in code reviews and provide constructive feedback, Mentor junior developers, Deploy and maintain applications in production",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "SENIOR" as ExperienceLevel,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
    benefits: [
      "Health Insurance",
      "Remote Work",
      "401k",
      "Unlimited PTO",
      "Learning Budget",
    ],
    salaryMin: 120000,
    salaryMax: 180000,
  },
  {
    title: "DevOps Engineer",
    description:
      "Join our infrastructure team to help build and maintain our cloud infrastructure. You will work with cutting-edge technologies including Kubernetes, Terraform, and AWS. The role involves ensuring our systems are reliable, scalable, and secure while implementing automation wherever possible.",
    requirements:
      "Required: 3+ years of DevOps experience, Strong knowledge of AWS or GCP, Experience with Docker and Kubernetes, Proficiency in scripting (Python, Bash), Understanding of CI/CD pipelines, Experience with infrastructure as code",
    responsibilities:
      "Manage and optimize cloud infrastructure, Implement and maintain CI/CD pipelines, Monitor system performance and reliability, Automate deployment processes, Ensure security best practices, Respond to incidents and troubleshoot issues",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Python", "CI/CD"],
    benefits: [
      "Health Insurance",
      "Flexible Hours",
      "Stock Options",
      "Professional Development",
    ],
    salaryMin: 100000,
    salaryMax: 150000,
  },
  {
    title: "UI/UX Designer",
    description:
      "We are seeking a talented UI/UX Designer to create amazing user experiences for our products. You will work closely with product managers and developers to design intuitive and beautiful interfaces that delight our users. This role requires both strong design skills and understanding of user psychology.",
    requirements:
      "Required: 3+ years of UI/UX design experience, Proficiency in Figma and Adobe XD, Strong portfolio demonstrating design skills, Understanding of user-centered design principles, Experience with user research and usability testing, Knowledge of design systems",
    responsibilities:
      "Create wireframes, mockups, and prototypes, Design user interfaces for web and mobile applications, Conduct user research and usability testing, Collaborate with development teams to ensure design implementation, Maintain and evolve design systems, Present designs to stakeholders",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    skills: [
      "Figma",
      "UI/UX Design",
      "Wireframing",
      "Prototyping",
      "User Research",
    ],
    benefits: [
      "Health Insurance",
      "Remote Work",
      "Creative Freedom",
      "Conference Budget",
    ],
    salaryMin: 90000,
    salaryMax: 130000,
  },
  {
    title: "Data Scientist",
    description:
      "Looking for a Data Scientist to help us make data-driven decisions and build intelligent systems. You will work with large datasets, build machine learning models, and extract valuable insights that drive business decisions. This role combines statistical analysis, machine learning, and business acumen.",
    requirements:
      "Required: PhD or Masters in related field, 4+ years of experience in data science, Strong Python skills, Experience with ML frameworks (TensorFlow, PyTorch), Knowledge of statistics and mathematics, SQL expertise, Experience with data visualization",
    responsibilities:
      "Build and deploy machine learning models, Analyze large datasets to extract insights, Create data visualizations and dashboards, Collaborate with product teams to define metrics, Present findings to stakeholders, Mentor junior data scientists",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "SENIOR" as ExperienceLevel,
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "SQL",
      "Data Analysis",
    ],
    benefits: [
      "Health Insurance",
      "Research Time",
      "Conference Attendance",
      "Stock Options",
    ],
    salaryMin: 130000,
    salaryMax: 200000,
  },
  {
    title: "Frontend Developer (React)",
    description:
      "Join our frontend team to build beautiful and performant user interfaces. You will work with React and modern JavaScript to create exceptional web experiences. This role is perfect for someone passionate about creating pixel-perfect UIs with smooth interactions.",
    requirements:
      "Required: 2+ years of React experience, Strong JavaScript/TypeScript skills, Experience with state management (Redux), Understanding of responsive design, Knowledge of testing frameworks, Familiarity with modern build tools",
    responsibilities:
      "Develop React applications, Write clean and maintainable code, Optimize application performance, Collaborate with designers to implement UI/UX, Write unit and integration tests, Participate in agile ceremonies",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    skills: ["React", "TypeScript", "Redux", "CSS", "Jest"],
    benefits: [
      "Health Insurance",
      "Flexible Hours",
      "Learning Budget",
      "Gym Membership",
    ],
    salaryMin: 80000,
    salaryMax: 120000,
  },
  {
    title: "Mobile Developer (React Native)",
    description:
      "We need a talented Mobile Developer to build cross-platform mobile applications using React Native. You will work on features used by millions of users and ensure smooth performance on both iOS and Android platforms.",
    requirements:
      "Required: 3+ years of mobile development experience, Strong React Native skills, Experience with iOS and Android, Knowledge of mobile UI patterns, Understanding of mobile performance optimization, Experience with native modules",
    responsibilities:
      "Develop mobile applications for iOS and Android, Implement new features and improvements, Fix bugs and optimize performance, Work with backend APIs, Publish apps to app stores, Write technical documentation",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    skills: ["React Native", "iOS", "Android", "JavaScript", "Redux"],
    benefits: [
      "Health Insurance",
      "Remote Work",
      "Device Allowance",
      "Stock Options",
    ],
    salaryMin: 95000,
    salaryMax: 140000,
  },
  {
    title: "Backend Engineer (Python)",
    description:
      "Looking for a Backend Engineer to build robust and scalable APIs. You will work with Python and modern frameworks to power our applications. The ideal candidate has experience with database design, API development, and distributed systems.",
    requirements:
      "Required: 4+ years of Python experience, Strong knowledge of Django or FastAPI, Experience with PostgreSQL, Understanding of RESTful APIs, Knowledge of authentication and security, Experience with caching strategies",
    responsibilities:
      "Design and implement RESTful APIs, Write efficient database queries, Ensure application security and performance, Optimize query performance, Document technical solutions, Review code and mentor team members",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "SENIOR" as ExperienceLevel,
    skills: ["Python", "Django", "PostgreSQL", "REST API", "Redis"],
    benefits: [
      "Health Insurance",
      "Remote Work",
      "Unlimited PTO",
      "401k Match",
    ],
    salaryMin: 110000,
    salaryMax: 160000,
  },
  {
    title: "Junior Software Engineer",
    description:
      "Great opportunity for recent graduates or early-career developers to learn from experienced engineers while contributing to real projects. You will receive mentorship and grow your skills in a supportive environment.",
    requirements:
      "Required: Bachelor degree in Computer Science or related field, Knowledge of at least one programming language, Understanding of data structures and algorithms, Eagerness to learn new technologies, Good communication skills, Basic Git knowledge",
    responsibilities:
      "Write code under supervision of senior engineers, Fix bugs and implement features, Participate in code reviews, Learn new technologies and best practices, Collaborate with team members, Document your work",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "ENTRY" as ExperienceLevel,
    skills: ["JavaScript", "Python", "Git", "HTML", "CSS"],
    benefits: [
      "Health Insurance",
      "Mentorship Program",
      "Learning Budget",
      "Career Growth",
    ],
    salaryMin: 60000,
    salaryMax: 85000,
  },
  {
    title: "Machine Learning Engineer",
    description:
      "Join our AI team to build and deploy machine learning models at scale. You will work on exciting problems including NLP, computer vision, and recommendation systems using state-of-the-art ML techniques.",
    requirements:
      "Required: 3+ years of ML experience, Strong Python skills, Experience with PyTorch or TensorFlow, Knowledge of ML algorithms, Understanding of model deployment, Experience with MLOps",
    responsibilities:
      "Build and train ML models, Deploy models to production, Monitor model performance, Collaborate with data scientists, Optimize model efficiency, Document ML pipelines",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "SENIOR" as ExperienceLevel,
    skills: ["Python", "PyTorch", "Machine Learning", "MLOps", "Docker"],
    benefits: [
      "Health Insurance",
      "GPU Access",
      "Research Time",
      "Conference Budget",
    ],
    salaryMin: 140000,
    salaryMax: 210000,
  },
  {
    title: "Product Manager",
    description:
      "Looking for a Product Manager to drive product strategy and execution. You will work with engineering, design, and business teams to build products that users love.",
    requirements:
      "Required: 3+ years of product management experience, Strong analytical skills, Experience with product metrics, Excellent communication skills, Technical background preferred, Experience with agile methodologies",
    responsibilities:
      "Define product roadmap and strategy, Work with stakeholders to prioritize features, Write product requirements, Analyze user data and metrics, Conduct user research, Present to executives",
    jobType: "FULL_TIME" as JobType,
    experienceLevel: "INTERMEDIATE" as ExperienceLevel,
    skills: ["Product Management", "Agile", "Analytics", "User Research"],
    benefits: [
      "Health Insurance",
      "Stock Options",
      "Flexible Hours",
      "Learning Budget",
    ],
    salaryMin: 110000,
    salaryMax: 160000,
  },
];

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.analytics.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.job.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // Create admin user
  console.log("👑 Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@jobportal.com",
      password: hashedPassword,
      role: "ADMIN",
      isAdmin: true,
      emailVerified: new Date(),
      accountStatus: "ACTIVE",
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create candidates
  console.log("\n👥 Creating candidate users...");
  const candidates = [];
  for (const candidate of candidatesData) {
    const user = await prisma.user.create({
      data: {
        name: candidate.name,
        email: candidate.email,
        password: hashedPassword,
        role: "CANDIDATE",
        emailVerified: new Date(),
        accountStatus: "ACTIVE",
        lastLoginAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        loginCount: Math.floor(Math.random() * 50) + 5,
        profile: {
          create: {
            bio: candidate.bio,
            phone: candidate.phone,
            location: candidate.location,
            website: candidate.website,
            skills: candidate.skills,
            yearsOfExperience: candidate.yearsOfExperience,
            experienceLevel: candidate.experienceLevel,
            education: candidate.education,
            workExperience: candidate.workExperience,
            isComplete: true,
          },
        },
      },
    });
    candidates.push(user);
    console.log(`✅ Created candidate: ${user.email}`);
  }

  // Create companies and their jobs
  console.log("\n🏢 Creating company users and jobs...");
  const companies = [];
  const allJobs = [];

  for (const company of companiesData) {
    const user = await prisma.user.create({
      data: {
        name: company.name,
        email: company.email,
        password: hashedPassword,
        role: "COMPANY",
        emailVerified: new Date(),
        accountStatus: "ACTIVE",
        lastLoginAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        loginCount: Math.floor(Math.random() * 40) + 3,
        profile: {
          create: {
            companyName: company.companyName,
            bio: company.bio,
            phone: company.phone,
            location: company.location,
            website: company.website,
            companySize: company.companySize,
            industry: company.industry,
            description: company.description,
            foundedYear: company.foundedYear,
            headquarters: company.headquarters,
            skills: [],
            isComplete: true,
          },
        },
      },
    });
    companies.push(user);
    console.log(`✅ Created company: ${company.companyName} (${user.email})`);

    // Create 3-5 jobs for each company
    const numJobs = Math.floor(Math.random() * 3) + 3;
    const shuffledJobs = [...jobDescriptions].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numJobs; i++) {
      const jobTemplate = shuffledJobs[i % shuffledJobs.length];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];

      const rand = Math.random();
      const status = rand < 0.7 ? "ACTIVE" : rand < 0.9 ? "DRAFT" : "CLOSED";

      const createdDaysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(
        Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000
      );

      const job = await prisma.job.create({
        data: {
          companyId: user.id,
          title: jobTemplate.title,
          description: jobTemplate.description,
          requirements: jobTemplate.requirements,
          responsibilities: jobTemplate.responsibilities,
          location: randomLocation,
          jobType: jobTemplate.jobType,
          experienceLevel: jobTemplate.experienceLevel,
          salaryMin: jobTemplate.salaryMin,
          salaryMax: jobTemplate.salaryMax,
          currency: company.location.includes("Pakistan") ? "PKR" : "USD",
          skills: jobTemplate.skills,
          benefits: jobTemplate.benefits,
          status: status as JobStatus,
          views: Math.floor(Math.random() * 200),
          applicationDeadline:
            status === "ACTIVE"
              ? new Date(
                  Date.now() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000
                )
              : null,
          createdAt,
          updatedAt: createdAt,
        },
      });
      allJobs.push(job);
      console.log(`  📋 Created job: ${job.title} (${status})`);
    }
  }

  // Create applications
  console.log("\n📝 Creating applications...");
  const applicationStatuses: ApplicationStatus[] = [
    "APPLIED",
    "REVIEWING",
    "INTERVIEWING",
    "OFFERED",
    "REJECTED",
  ];
  let applicationCount = 0;

  for (const candidate of candidates) {
    const numApplications = Math.floor(Math.random() * 5) + 2;
    const shuffledJobs = [...allJobs].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numApplications, shuffledJobs.length); i++) {
      const job = shuffledJobs[i];

      if (job.status !== "ACTIVE") continue;

      const appliedDaysAgo = Math.floor(Math.random() * 30);
      const appliedAt = new Date(
        Date.now() - appliedDaysAgo * 24 * 60 * 60 * 1000
      );

      const status =
        applicationStatuses[
          Math.floor(Math.random() * applicationStatuses.length)
        ];

      try {
        await prisma.application.create({
          data: {
            candidateId: candidate.id,
            jobId: job.id,
            companyId: job.companyId,
            status,
            coverLetter: `I am very interested in the ${job.title} position at your company. My skills and experience align well with the requirements.`,
            appliedAt,
            lastUpdated: new Date(
              appliedAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000
            ),
          },
        });
        applicationCount++;
      } catch (error) {
        // Skip if duplicate
      }
    }
  }
  console.log(`✅ Created ${applicationCount} applications`);

  // Create saved jobs
  console.log("\n🔖 Creating saved jobs...");
  let savedJobCount = 0;

  for (const candidate of candidates) {
    const numSaved = Math.floor(Math.random() * 8) + 3;
    const shuffledJobs = [...allJobs].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(numSaved, shuffledJobs.length); i++) {
      try {
        await prisma.savedJob.create({
          data: {
            userId: candidate.id,
            jobId: shuffledJobs[i].id,
            notes:
              Math.random() > 0.5
                ? "Interesting opportunity, apply soon!"
                : null,
          },
        });
        savedJobCount++;
      } catch (error) {
        // Skip if duplicate
      }
    }
  }
  console.log(`✅ Created ${savedJobCount} saved jobs`);

  // Create notifications
  console.log("\n🔔 Creating notifications...");
  const notificationTypes: NotificationType[] = [
    "JOB_MATCH",
    "APPLICATION_STATUS",
    "NEW_JOB",
    "SYSTEM",
  ];
  let notificationCount = 0;

  for (const candidate of candidates) {
    const numNotifications = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < numNotifications; i++) {
      const type =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const createdDaysAgo = Math.floor(Math.random() * 14);
      const isRead = Math.random() > 0.3;

      await prisma.notification.create({
        data: {
          userId: candidate.id,
          type,
          priority: Math.random() > 0.7 ? "HIGH" : "MEDIUM",
          title:
            type === "JOB_MATCH"
              ? "New Job Match Found!"
              : type === "APPLICATION_STATUS"
              ? "Application Status Updated"
              : type === "NEW_JOB"
              ? "New Job Posted"
              : "System Notification",
          message:
            type === "JOB_MATCH"
              ? "We found a job that matches your profile with 85% compatibility!"
              : type === "APPLICATION_STATUS"
              ? "Your application status has been updated to Reviewing"
              : type === "NEW_JOB"
              ? "A new job matching your preferences has been posted"
              : "Welcome to the AI Job Portal!",
          link: "/dashboard/matches",
          read: isRead,
          emailSent: Math.random() > 0.5,
          createdAt: new Date(
            Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000
          ),
        },
      });
      notificationCount++;
    }
  }

  for (const company of companies) {
    const numNotifications = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < numNotifications; i++) {
      await prisma.notification.create({
        data: {
          userId: company.id,
          type: "NEW_JOB",
          priority: "MEDIUM",
          title: "New Application Received",
          message: "You received a new application for your job posting",
          link: "/dashboard/applications",
          read: Math.random() > 0.4,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000
          ),
        },
      });
      notificationCount++;
    }
  }
  console.log(`✅ Created ${notificationCount} notifications`);

  // Create search history
  console.log("\n🔍 Creating search history...");
  const searchQueries = [
    "React developer remote",
    "Senior Python engineer",
    "UI/UX designer San Francisco",
    "DevOps engineer AWS",
    "Data scientist machine learning",
    "Full stack developer",
    "Mobile developer React Native",
    "Backend engineer Python",
    "Frontend developer TypeScript",
    "Cloud architect",
  ];

  let searchCount = 0;
  for (const candidate of candidates) {
    const numSearches = Math.floor(Math.random() * 15) + 5;

    for (let i = 0; i < numSearches; i++) {
      const query =
        searchQueries[Math.floor(Math.random() * searchQueries.length)];

      await prisma.searchHistory.create({
        data: {
          userId: candidate.id,
          query,
          filters: {
            location: locations[Math.floor(Math.random() * locations.length)],
            jobType: ["FULL_TIME"],
            experienceLevel: ["INTERMEDIATE", "SENIOR"],
          },
          resultCount: Math.floor(Math.random() * 50) + 10,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ),
        },
      });
      searchCount++;
    }
  }
  console.log(`✅ Created ${searchCount} search records`);

  // Create activity logs
  console.log("\n📊 Creating activity logs...");
  const actions = [
    "USER_LOGIN",
    "JOB_CREATED",
    "APPLICATION_SUBMITTED",
    "PROFILE_UPDATED",
    "JOB_VIEWED",
    "SEARCH_PERFORMED",
  ];
  let activityCount = 0;

  const allUsers = [...candidates, ...companies, admin];

  for (let i = 0; i < 200; i++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        entity: action.includes("JOB")
          ? "job"
          : action.includes("APPLICATION")
          ? "application"
          : "user",
        entityId:
          action.includes("JOB") && allJobs.length > 0
            ? allJobs[Math.floor(Math.random() * allJobs.length)].id
            : null,
        metadata: { userAgent: "Mozilla/5.0", action_details: "Demo activity" },
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
          Math.random() * 255
        )}`,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ),
      },
    });
    activityCount++;
  }
  console.log(`✅ Created ${activityCount} activity logs`);

  // Create analytics data for last 30 days
  console.log("\n📈 Creating analytics data...");
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const baseUsers = candidates.length + companies.length;
    const variance = Math.floor(Math.random() * 5) - 2;

    await prisma.analytics.create({
      data: {
        date,
        totalUsers: baseUsers + variance,
        newUsers: Math.floor(Math.random() * 5),
        activeUsers:
          Math.floor(baseUsers * 0.6) + Math.floor(Math.random() * 10),
        candidateCount: candidates.length + Math.floor(Math.random() * 3) - 1,
        companyCount: companies.length,
        totalJobs: allJobs.length + Math.floor(Math.random() * 3) - 1,
        activeJobs: allJobs.filter((j) => j.status === "ACTIVE").length,
        newJobs: Math.floor(Math.random() * 3),
        totalApplications: applicationCount + Math.floor(Math.random() * 5) - 2,
        newApplications: Math.floor(Math.random() * 8),
        totalSearches: Math.floor(Math.random() * 50) + 20,
        totalMatches: Math.floor(Math.random() * 30) + 10,
        avgMatchScore: 70 + Math.random() * 20,
      },
    });
  }
  console.log("✅ Created 31 days of analytics data");

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📧 Demo Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 Password for all users: Password123!");
  console.log("\n👑 Admin Account:");
  console.log("   • admin@jobportal.com");
  console.log("\n👥 Candidate Accounts:");
  candidatesData.forEach((c) => console.log(`   • ${c.email}`));
  console.log("\n🏢 Company Accounts:");
  companiesData.forEach((c) =>
    console.log(`   • ${c.email} (${c.companyName})`)
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 Database Statistics:");
  console.log(`   • ${candidates.length} Candidates`);
  console.log(`   • ${companies.length} Companies`);
  console.log(`   • ${allJobs.length} Jobs`);
  console.log(`   • ${applicationCount} Applications`);
  console.log(`   • ${savedJobCount} Saved Jobs`);
  console.log(`   • ${notificationCount} Notifications`);
  console.log(`   • ${searchCount} Search Records`);
  console.log(`   • ${activityCount} Activity Logs`);
  console.log(`   • 31 Days of Analytics`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
