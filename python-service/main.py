from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import docx
import pdfplumber
import io
import logging
import re
from typing import List, Dict

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SearchQuery(BaseModel):
    query: str

class EnhancedSearchQuery(BaseModel):
    original_query: str
    extracted_keywords: List[str]
    job_titles: List[str]
    skills: List[str]
    locations: List[str]
    experience_level: str = None
    job_type: str = None
    salary_range: Dict[str, int] = None

# Common job titles and keywords
JOB_TITLES = [
    "developer", "engineer", "designer", "manager", "analyst", "architect",
    "consultant", "specialist", "administrator", "coordinator", "director",
    "lead", "senior", "junior", "staff", "principal", "chief",
    "frontend", "backend", "full stack", "fullstack", "devops", "data scientist",
    "product manager", "project manager", "scrum master", "qa", "tester",
    "ui/ux", "graphic designer", "mobile developer", "software engineer"
]

SKILLS = [
    "react", "vue", "angular", "node", "python", "java", "javascript", "typescript",
    "aws", "azure", "gcp", "docker", "kubernetes", "sql", "nosql", "mongodb",
    "postgresql", "mysql", "redis", "graphql", "rest", "api", "microservices",
    "machine learning", "ml", "ai", "data analysis", "tensorflow", "pytorch",
    "django", "flask", "spring", "express", "next.js", "nextjs", "nest.js",
    "git", "ci/cd", "jenkins", "terraform", "ansible", "linux", "agile", "scrum"
]

EXPERIENCE_LEVELS = ["entry", "junior", "mid", "senior", "lead", "principal", "executive"]
JOB_TYPES = ["full time", "full-time", "part time", "part-time", "contract", "freelance", "internship"]

def extract_text_from_pdf_pypdf2(file_content: bytes) -> str:
    """Extract text from PDF using PyPDF2."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"PyPDF2 extraction failed: {e}")
        return ""

def extract_text_from_pdf_pdfplumber(file_content: bytes) -> str:
    """Extract text from PDF using pdfplumber (more accurate)."""
    try:
        pdf_file = io.BytesIO(file_content)
        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"pdfplumber extraction failed: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file."""
    try:
        doc_file = io.BytesIO(file_content)
        doc = docx.Document(doc_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text from DOCX: {str(e)}")

def extract_salary_range(text: str) -> Dict[str, int]:
    """Extract salary range from text."""
    text_lower = text.lower()
    
    # Pattern for salary ranges like "$100k-$150k", "$100,000 - $150,000", "100k-150k"
    patterns = [
        r'\$?(\d+)k?\s*-\s*\$?(\d+)k',
        r'\$?([\d,]+)\s*-\s*\$?([\d,]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            min_val = int(match.group(1).replace(',', ''))
            max_val = int(match.group(2).replace(',', ''))
            
            # Convert k notation to thousands
            if 'k' in match.group(0).lower():
                min_val *= 1000
                max_val *= 1000
            
            return {"min": min_val, "max": max_val}
    
    return None

def process_search_query(query: str) -> EnhancedSearchQuery:
    """
    Process natural language search query to extract structured information.
    """
    query_lower = query.lower()
    
    # Extract job titles
    found_job_titles = []
    for title in JOB_TITLES:
        if title in query_lower:
            found_job_titles.append(title)
    
    # Extract skills
    found_skills = []
    for skill in SKILLS:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, query_lower):
            found_skills.append(skill)
    
    # Extract experience level
    experience_level = None
    for level in EXPERIENCE_LEVELS:
        if level in query_lower:
            experience_level = level
            break
    
    # Extract job type
    job_type = None
    for jtype in JOB_TYPES:
        if jtype in query_lower:
            job_type = jtype.replace('-', '_').replace(' ', '_').upper()
            break
    
    # Extract salary range
    salary_range = extract_salary_range(query)
    
    # Extract locations (simple approach - looking for common patterns)
    location_patterns = [
        r'\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # "in San Francisco"
        r'\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # "at New York"
        r'\b(remote)\b',
    ]
    
    found_locations = []
    for pattern in location_patterns:
        matches = re.finditer(pattern, query)
        for match in matches:
            location = match.group(1) if len(match.groups()) > 0 else match.group(0)
            found_locations.append(location)
    
    # Extract general keywords (remove common words)
    stop_words = {'looking', 'for', 'job', 'jobs', 'position', 'positions', 'role', 'roles', 
                  'in', 'at', 'with', 'and', 'or', 'the', 'a', 'an', 'find', 'search'}
    
    words = query_lower.split()
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    # Remove duplicates while preserving order
    keywords = list(dict.fromkeys(keywords))
    
    return EnhancedSearchQuery(
        original_query=query,
        extracted_keywords=keywords,
        job_titles=found_job_titles,
        skills=found_skills,
        locations=found_locations,
        experience_level=experience_level,
        job_type=job_type,
        salary_range=salary_range
    )

@app.post("/extract-cv-text")
async def extract_cv_text(file: UploadFile = File(...)):
    """
    Extract text from CV file (PDF or DOCX).
    Returns the extracted text.
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Determine file type and extract text
        if file.filename.lower().endswith('.pdf'):
            # Try pdfplumber first (more accurate)
            text = extract_text_from_pdf_pdfplumber(file_content)
            
            # Fallback to PyPDF2 if pdfplumber fails
            if not text or len(text) < 50:
                logger.info("pdfplumber extraction insufficient, trying PyPDF2")
                text = extract_text_from_pdf_pypdf2(file_content)
            
            if not text or len(text) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from PDF. Please ensure the PDF is not scanned/image-based."
                )
                
        elif file.filename.lower().endswith(('.doc', '.docx')):
            text = extract_text_from_docx(file_content)
            
            if not text or len(text) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from document."
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload PDF or DOCX."
            )
        
        # Clean up the text
        text = text.replace('\x00', '')  # Remove null bytes
        text = ' '.join(text.split())  # Normalize whitespace
        
        logger.info(f"Successfully extracted {len(text)} characters from {file.filename}")
        
        return {
            "success": True,
            "text": text,
            "length": len(text),
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-search-query")
async def process_search(query_data: SearchQuery):
    """
    Process natural language search query to extract structured information.
    """
    try:
        enhanced_query = process_search_query(query_data.query)
        
        return {
            "success": True,
            "enhanced_query": enhanced_query.dict()
        }
        
    except Exception as e:
        logger.error(f"Search processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)