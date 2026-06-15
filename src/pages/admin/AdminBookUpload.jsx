import { useState, useEffect } from 'react';
import {
  getOrgsApi,
  getCategoriesApi,
  getPositionsApi,
  uploadBookApi,
  importQuestionsApi
} from '../../services/adminService';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  RefreshCw,
  Code
} from 'lucide-react';

const AdminBookUpload = () => {
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'json'
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);

  // Form states (Book Upload)
  const [orgId, setOrgId] = useState('');
  const [catId, setCatId] = useState('');
  const [posId, setPosId] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [file, setFile] = useState(null);

  // Form states (JSON Import)
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonIsValid, setJsonIsValid] = useState(null); // null, true, false
  const [showJsonSample, setShowJsonSample] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Fetch initial organizations list
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrgsApi();
        setOrganizations(res.data || res);
      } catch (err) {
        setError('Failed to load organizations.');
      }
    };
    fetchOrgs();
  }, []);

  // Fetch categories when organization changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (!orgId) {
        setCategories([]);
        setCatId('');
        return;
      }
      try {
        const res = await getCategoriesApi(orgId);
        const catList = res.data || res;
        setCategories(catList);
        if (catList.length > 0) {
          setCatId(catList[0]._id);
        } else {
          setCatId('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [orgId]);

  // Fetch positions when category changes
  useEffect(() => {
    const fetchPositions = async () => {
      if (!catId || !orgId) {
        setPositions([]);
        setPosId('');
        return;
      }
      try {
        const res = await getPositionsApi(catId, orgId);
        setPositions(res.data || res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPositions();
  }, [catId, orgId]);

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.docx') || file.name.endsWith('.pdf')) {
      setFile(file);
      setError('');
    } else {
      setFile(null);
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId || !catId || !file) {
      setError('Please select organization, category, and choose a valid file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('organization', orgId);
    formData.append('category', catId);
    formData.append('difficulty', difficulty);
    if (posId) formData.append('position', posId);

    try {
      const res = await uploadBookApi(formData);
      if (res.success) {
        setSuccessData(res);
        setFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file or extract questions.');
    } finally {
      setLoading(false);
    }
  };

  // JSON handlers
  const handleJsonChange = (val) => {
    setJsonInput(val);
    if (!val.trim()) {
      setJsonError('');
      setJsonIsValid(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of question objects.');
        setJsonIsValid(false);
        return;
      }
      if (parsed.length === 0) {
        setJsonError('Array of questions cannot be empty.');
        setJsonIsValid(false);
        return;
      }
      const item = parsed[0];
      if (!item.organization || !item.category || !item.question) {
        setJsonError('Each question must contain at least "organization", "category", and "question" keys.');
        setJsonIsValid(false);
        return;
      }
      setJsonError('');
      setJsonIsValid(true);
    } catch (err) {
      setJsonError(`Invalid JSON format: ${err.message}`);
      setJsonIsValid(false);
    }
  };

  const loadSampleData = () => {
    const sample = [
      {
        organization: "Pakistan Police",
        category: "Written Exam",
        position: "Constable",
        question: "Tell us about yourself and why you want to join Pakistan Police as a Constable?",
        idealAnswer: "I am a dedicated citizen who wants to serve the community, uphold justice, and maintain law and order. Pakistan Police Constable role allows direct contact and positive influence...",
        difficulty: "medium",
        tags: ["personal", "police", "intro"]
      },
      {
        organization: "Pakistan Army",
        category: "ISSB",
        position: "Commissioned Officer",
        question: "Why do you want to join the Armed Forces instead of a civilian career?",
        idealAnswer: "Serving in the Armed Forces is a matter of pride, discipline, and defense of the motherland. It offers a structured way of life and a direct role in national security...",
        difficulty: "hard",
        tags: ["motivation", "army", "issb"]
      }
    ];
    const sampleStr = JSON.stringify(sample, null, 2);
    setJsonInput(sampleStr);
    setJsonIsValid(true);
    setJsonError('');
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    if (!jsonIsValid || !jsonInput.trim()) {
      setError('Please provide a valid JSON array of questions.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessData(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const res = await importQuestionsApi(parsed);
      if (res.success) {
        setSuccessData(res);
        setJsonInput('');
        setJsonIsValid(null);
      }
    } catch (err) {
      const backendErr = err.response?.data;
      if (backendErr?.errors && Array.isArray(backendErr.errors)) {
        setError(
          <div className="text-left">
            <p className="font-bold mb-1">{backendErr.message || 'Import failed due to errors:'}</p>
            <ul className="list-disc pl-5 space-y-1 max-h-[160px] overflow-y-auto">
              {backendErr.errors.map((eStr, i) => (
                <li key={i} className="text-xs">{eStr}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        setError(err.response?.data?.message || 'Failed to import JSON questions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setError('');
    setFile(null);
    setJsonInput('');
    setJsonError('');
    setJsonIsValid(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-display">Import Questions</h1>
        <p className="text-gray-400 text-sm mt-1">Import new questions in bulk via PDF/DOCX/TXT book extraction, or by pasting a structured JSON array.</p>
      </div>

      {/* Tab Switcher */}
      {!successData && (
        <div className="flex border-b border-gray-850">
          <button
            onClick={() => { setActiveTab('book'); resetForm(); }}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'book'
                ? 'border-red-500 text-white font-bold bg-red-500/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/10'
            }`}
          >
            Upload Book File
          </button>
          <button
            onClick={() => { setActiveTab('json'); resetForm(); }}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'border-red-500 text-white font-bold bg-red-500/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/10'
            }`}
          >
            Paste JSON Payload
          </button>
        </div>
      )}

      {successData ? (
        /* SUCCESS ZONE */
        <div className="glass-panel p-8 rounded-2xl border border-green-500/25 bg-gradient-to-br from-green-500/10 to-transparent space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import Successful!</h2>
              <p className="text-sm text-gray-400">{successData.message}</p>
            </div>
          </div>

          {successData.errors && successData.errors.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs space-y-1">
              <p className="font-bold">Partial errors occurred during import:</p>
              <ul className="list-disc pl-5 space-y-1 max-h-[120px] overflow-y-auto">
                {successData.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-850">
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Questions Saved</span>
              <span className="text-2xl font-extrabold text-white">{successData.data?.saved || 0}</span>
            </div>
            <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-850">
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Import Method</span>
              <span className="text-sm font-bold text-red-400 capitalize">{activeTab === 'book' ? 'AI Book Extraction' : 'JSON Bulk Import'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-850 flex justify-end">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg hover:shadow-green-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Import More Questions
            </button>
          </div>
        </div>
      ) : activeTab === 'book' ? (
        /* UPLOAD ZONE */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Upload Document
              </h3>

              {/* Drag Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all ${
                  dragOver
                    ? 'border-red-500 bg-red-500/5'
                    : file
                    ? 'border-gray-700 bg-gray-900/10'
                    : 'border-gray-800 hover:border-gray-700 bg-gray-900/5'
                }`}
              >
                <input
                  type="file"
                  id="book-upload-input"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  disabled={loading}
                />

                {file ? (
                  <div className="space-y-4">
                    <FileText className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="px-3 py-1 text-xs border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-lg transition-all"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <label htmlFor="book-upload-input" className="cursor-pointer space-y-4">
                    <UploadCloud className="w-12 h-12 text-gray-500 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-white">Drag & drop your PDF, DOCX, or TXT book here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse local files (max 20 MB)</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Configuration sidebar */}
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-gray-855 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                Target Settings
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase tracking-wider">
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none cursor-pointer"
                  disabled={loading}
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-455 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  className="glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none cursor-pointer"
                  disabled={!orgId || loading}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-455 uppercase tracking-wider">
                  Position (Optional)
                </label>
                <select
                  value={posId}
                  onChange={(e) => setPosId(e.target.value)}
                  className="glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none cursor-pointer"
                  disabled={!catId || loading}
                >
                  <option value="">All Positions</option>
                  {positions.map((pos) => (
                    <option key={pos._id} value={pos._id}>{pos.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-455 uppercase tracking-wider">
                  Question Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none cursor-pointer"
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !file || !orgId || !catId}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-display"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Q&A...
                  </>
                ) : (
                  'Start AI Extraction'
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* JSON BULK IMPORT ZONE */
        <form onSubmit={handleJsonSubmit} className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-red-500" />
                Paste JSON Questions Array
              </h3>
              <button
                type="button"
                onClick={() => setShowJsonSample(!showJsonSample)}
                className="text-xs text-red-400 hover:text-red-300 font-semibold transition-all hover:underline cursor-pointer"
              >
                {showJsonSample ? 'Hide Example Schema' : 'Show Example Schema'}
              </button>
            </div>

            {showJsonSample && (
              <div className="p-4 bg-gray-900/40 rounded-xl border border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Required Schema Format</span>
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="px-3 py-1 bg-red-650/25 border border-red-500/30 hover:bg-red-550/30 text-red-405 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Load Sample Template
                  </button>
                </div>
                <pre className="text-[11px] text-gray-300 font-mono overflow-x-auto max-h-[180px] p-3 bg-black/40 rounded-lg border border-gray-850">
{`[
  {
    "organization": "Pakistan Police",
    "category": "Written Exam",
    "position": "Constable",
    "question": "Tell us about yourself and why you want to join Pakistan Police as a Constable?",
    "idealAnswer": "I am a dedicated citizen who wants to serve the community...",
    "difficulty": "medium",
    "tags": ["personal", "police"]
  }
]`}
                </pre>
              </div>
            )}

            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='Paste your JSON array format here...'
                rows={15}
                className="w-full font-mono text-xs p-4 bg-black/20 text-gray-200 border border-gray-850 rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all focus:outline-none"
                disabled={loading}
                required
              />

              {jsonIsValid !== null && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 rounded-lg backdrop-blur-sm">
                  {jsonIsValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider font-mono">Valid JSON</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono">Invalid JSON</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {jsonError && (
              <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-400 text-xs font-mono">
                {jsonError}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => { setJsonInput(''); setJsonIsValid(null); setJsonError(''); }}
              disabled={loading || !jsonInput}
              className="px-5 py-2.5 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !jsonIsValid}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-display"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing Questions...
                </>
              ) : (
                'Import JSON Questions'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminBookUpload;
