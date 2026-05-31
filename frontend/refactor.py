import re

def refactor():
    with open('app/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the massive SVG block
    svg_block_match = re.search(r'(\{key === "OPD" && \(\s*<svg.*?(?=\{key === "Other" && \().*?\{key === "Other" && \(\s*<svg.*?</svg>\s*\)\})', content, re.DOTALL)
    
    if not svg_block_match:
        print("Could not find SVG block")
        return
        
    svg_block = svg_block_match.group(1)
    
    # We will replace `{key === "OPD" && (` with `case "OPD": return (` etc.
    # Actually, we can just write a simpler DepartmentIcon component that takes `department` and uses these SVGs.
    
    # Build DepartmentIcon code
    dept_icon_code = """
const DepartmentIcon = ({ department, className = "w-full h-full" }: { department: string, className?: string }) => {
  switch (department) {
    case "OPD": return (
      <svg viewBox="0 0 128 128" className={className} aria-label="OPD">
        <path d="M0 0h128v128H0z" fill="none" />
        <path fill="none" stroke="#BDBDBD" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="6" d="M60.55 98.3c-16.79 4.83-26.01-18.83-29.53-27.27C24 54.17 5.69 42.41 7.04 30s16.6-11.17 16.6-11.17" />
        <path fill="none" stroke="#BDBDBD" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="6" d="M59.5 98.3c16.89-4.48 11.39-28.91 10.07-37.96c-2.63-18.08 7.04-37.57-.49-47.52S49.1 11.76 49.1 11.76" />
        <circle cx="101.84" cy="32.23" r="15.25" fill="#878787" />
        <circle cx="102.38" cy="31.13" r="13.41" fill="#BDBDBD" />
        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="8" d="M69.39 58.93c-.89 6.74 10.14 31.36-6.97 38.1c-19.16 7.56-26.31-20.55-31.39-26" />
        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="5" d="M32.63 73.54s10.77 11.36 23.4 6.15C68 74.75 69.86 61.64 69.86 61.64" />
        <path fill="#212121" d="M100.96 21.43c-5.24 1.22-8.49 6.45-7.28 11.69c.18.78.46 1.54.83 2.26l.68 1.34c-1.92 2.51-3.48 3.47-4.01 6.38c1.36 1.33 2.95 2.39 4.69 3.13c0-.01.01-.02.01-.03c0 .01.01.02.01.04c2.87 1.22 6.14 1.59 9.42.83c.37-.09.72-.2 1.07-.31l-.31-2.8s.4-3.55.49-3.74c.23-.45 1.16-.69 1.64-.97c1.16-.7 2.17-1.65 2.95-2.76a9.8 9.8 0 0 0 1.5-7.78c-1.22-5.24-6.46-8.5-11.69-7.28" opacity=".22" />
        <path fill="none" stroke="#03A9F4" strokeMiterlimit="10" strokeWidth="8" d="M60.42 96.03c9.59 21.97 24.29 25.08 35.15 23.19c9.54-1.67 22.17-10.22 22.14-25.72c-.04-18.68-12.5-17.5-19.25-29.47c-8.41-14.92 3.05-28.62 3.05-28.62" />
        <path fill="#212121" d="M94.74 38.77s1.9-.97 3.72.07c2.88 1.64 3.16 3.98 3.16 3.98s1.74-3.46 2.67-4.4c.92-.95-5.57-5.66-7.04-3.85s-2.51 4.2-2.51 4.2" opacity=".22" />
        <path fill="#616161" d="M27.83 14.04c-1.5.01-2.82.73-3.69 1.82l-1.24-.98c-1.13-.89-2.79-.08-2.78 1.36l.04 5.19c.01 1.44 1.68 2.23 2.79 1.32l1.21-.98c.88 1.09 2.22 1.8 3.73 1.79c2.63-.02 4.75-2.17 4.73-4.8s-2.16-4.74-4.79-4.72m25.3-1.82l-2.65-4.46c-.74-1.24-2.58-1.07-3.08.27l-.55 1.48c-1.31-.49-2.81-.42-4.1.35a4.76 4.76 0 0 0-1.66 6.53a4.76 4.76 0 0 0 6.53 1.66c1.3-.77 2.08-2.07 2.27-3.46l1.54.21c1.42.19 2.44-1.34 1.7-2.58" />
        <circle cx="104.19" cy="29.3" r="9.12" fill="#424242" />
        <circle cx="104.65" cy="28.59" r="7.08" fill="#D1D1D1" />
        <path fill="#757575" d="M42.37 15.11c-.83-1.19-.67-3.41.76-4.42s3.59-.57 4.42.76c.93 1.48-1.5.15-2.93 1.16s-1.25 3.94-2.25 2.5m-17.36 2.14c.36-1.41 2.13-2.74 3.83-2.32s2.78 2.33 2.32 3.83c-.51 1.67-1.1-1.04-2.8-1.45c-1.69-.42-3.78 1.64-3.35-.06" />
      </svg>
    );
    case "IPD": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="IPD">
        <path d="M2 20h20" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round"/>
        <path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="6" y="10" width="12" height="3" rx="1" fill="#A78BFA"/>
        <rect x="6" y="14" width="12" height="3" rx="1" fill="#A78BFA"/>
        <rect x="6" y="18" width="12" height="2" rx="1" fill="#A78BFA"/>
      </svg>
    );
    case "Pharmacy": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Pharmacy">
        <rect x="10" y="2" width="4" height="20" fill="#EF4444"/>
        <rect x="2" y="10" width="20" height="4" fill="#EF4444"/>
        <path d="M7 7l10 10" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round"/>
        <path d="M17 7l-10 10" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    );
    case "Optical": return (
      <svg viewBox="0 0 36 36" className={className} aria-label="Optical">
        <path d="M0 0h36v36H0z" fill="none" />
        <path fill="#31373d" d="M35.686 11.931c-.507-.522-6.83-1.094-13.263-.369c-1.283.144-1.363.51-4.425.63c-3.061-.119-3.141-.485-4.425-.63C7.14 10.837.817 11.41.31 11.931c-.252.261-.252 2.077 0 2.338c.254.261 1.035.606 1.403 1.827c.237.787.495 5.864 2.281 7.377c1.768 1.498 7.462 1.217 9.326.262c2.536-1.298 2.892-5.785 3.292-7.639c.203-.939 1.162-1.016 1.385-1.016s1.182.077 1.385 1.016c.401 1.853.757 6.34 3.292 7.639c1.865.955 7.558 1.236 9.326-.262c1.786-1.513 2.044-6.59 2.281-7.377c.368-1.22 1.149-1.566 1.403-1.827s.254-2.077.002-2.338" />
        <path fill="#55acee" d="M14.644 15.699c-.098 1.255-.521 4.966-1.757 6.083c-1.376 1.243-6.25 1.568-7.79.044c-.808-.799-1.567-4.018-1.503-6.816c.038-1.679 2.274-2.02 5.462-2.02c3.148 0 5.763.468-5.588 2.709m6.707 0c.098 1.255.521 4.966 1.757 6.083c1.376 1.243 6.25 1.568 7.79.044c.808-.799 1.567-4.018 1.503-6.816c-.038-1.679-2.274-2.02-5.462-2.02c-3.147 0-5.763.468-5.588 2.709" />
      </svg>
    );
    case "Billing": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Billing">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth={2}/>
        <rect x="2" y="10" width="20" height="2" fill="#FBBF24"/>
        <circle cx="7" cy="15" r="1.5" fill="#FEF3C7"/>
        <circle cx="11" cy="15" r="1.5" fill="#FEF3C7"/>
        <circle cx="15" cy="15" r="1.5" fill="#FEF3C7"/>
      </svg>
    );
    case "OT": return (
      <svg viewBox="0 0 1200 1200" className={className} aria-label="Operation Theater">
        <path d="M0 0h1200v1200H0z" fill="none" />
        <path fill="#8B5CF6" d="M516.786 78.404c-89.537 0-162.129 72.592-162.129 162.129c7.674 109.36 81.438 140.506 162.946 201.74c60.609 38.349 53.187 81.094 65.404 149.848c-53.95 13.664-118.616 29.877-157.011-2.765l-91.505-65.098c-.131-.108-.277-.2-.409-.307c-27.968-22.936-63.775-36.745-102.764-36.745c-68.543 0-127.057 42.54-150.768 102.66c-3.122 12.076-5.116 12.008-15.66 11.977c-35.857 0-64.89 29.032-64.89 64.894c0 35.858 29.033 64.893 64.893 64.893c30.988-3.452 19.907-7.164 37.461 15.967c29.63 38.812 76.376 63.869 128.966 63.869c66.145 0 122.994-39.62 148.209-96.418c28.644 16.406 53.42 22.574 86.081 27.02H1200c-90.997-165.847-316.997-140.223-465.608-154.451c-30.518-75.807-37.399-175.94-108.188-226.817h-.717c32.815-29.67 53.429-72.545 53.429-120.267c-.001-89.538-72.593-162.13-162.13-162.13zm0 81.064c44.769 0 81.063 36.296 81.063 81.063c0 44.769-36.296 81.064-81.063 81.064c-44.769 0-81.064-36.296-81.064-81.064s36.297-81.063 81.064-81.063M231.32 568.27c44.768 0 81.064 36.296 81.064 81.064s-36.296 81.063-81.064 81.063s-81.064-36.297-81.064-81.063c0-44.768 36.297-81.064 81.064-81.064m432.754 33.98c25.438 0 46.059 20.622 46.059 46.06s-20.621 46.06-46.059 46.06s-46.061-20.62-46.061-46.06c.002-25.438 20.623-46.06 46.061-46.06m3.48 222.007c62.491 126.303 105.737 281.315 263.46 297.339l-111.158-297.34zm-487.615 89.765v72.468h157.932v-72.468zm284.237 0v72.468h174.311l-33.367-72.468zm495.497 0l21.494 72.468H1139.1v-72.468z" />
      </svg>
    );
    case "Canteen": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Canteen">
        <path d="M18 8h1a4 4 0 010 8h-1" stroke="#F97316" strokeWidth={2} strokeLinecap="round"/>
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" fill="#F97316" stroke="#C2410C" strokeWidth={2}/>
        <line x1="6" y1="1" x2="6" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round"/>
        <line x1="10" y1="1" x2="10" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round"/>
        <line x1="14" y1="1" x2="14" y2="4" stroke="#F97316" strokeWidth={2} strokeLinecap="round"/>
        <path d="M6 12h12" stroke="#FED7AA" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    );
    case "Lab & Diagnostics": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Lab & Diagnostics">
        <path d="M6 18v-6" stroke="#10B981" strokeWidth={2} strokeLinecap="round"/>
        <path d="M10 18v-3" stroke="#10B981" strokeWidth={2} strokeLinecap="round"/>
        <path d="M14 18v-8" stroke="#10B981" strokeWidth={2} strokeLinecap="round"/>
        <path d="M18 18V6" stroke="#10B981" strokeWidth={2} strokeLinecap="round"/>
        <path d="M2 18h20" stroke="#10B981" strokeWidth={2} strokeLinecap="round"/>
        <circle cx="6" cy="10" r="2" fill="#34D399"/>
        <circle cx="10" cy="13" r="2" fill="#34D399"/>
        <circle cx="14" cy="8" r="2" fill="#34D399"/>
        <circle cx="18" cy="6" r="2" fill="#34D399"/>
      </svg>
    );
    case "Reception": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Reception">
        <path d="M2 20h20" stroke="#6366F1" strokeWidth={2} strokeLinecap="round"/>
        <path d="M4 20V10a2 2 0 012-2h12a2 2 0 012 2v10" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="8" y="14" width="3" height="6" fill="#818CF8"/>
        <rect x="13" y="14" width="3" height="6" fill="#818CF8"/>
        <rect x="6" y="10" width="12" height="3" fill="#A5B4FC"/>
        <circle cx="12" cy="11.5" r="1" fill="#E0E7FF"/>
      </svg>
    );
    case "Other": return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Other">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="#64748B" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6" fill="#94A3B8" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round"/>
        <path d="M16 17H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round"/>
        <path d="M10 9H8" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    );
    default: return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="#64748B" stroke="#475569" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
};
"""
    
    # 1. Replace the giant SVG block in the Home grid with <DepartmentIcon department={key} />
    content = content.replace(svg_block, "<DepartmentIcon department={key} />\n")
    
    # 2. Add DepartmentIcon component near top (after translations)
    import_index = content.find("export default function Home()")
    content = content[:import_index] + dept_icon_code + "\n" + content[import_index:]
    
    # 3. Add Custom Select Dropdown logic inside Home()
    # Actually, we can add a CustomDropdown component outside Home too
    custom_dropdown_code = """
const CustomDepartmentSelect = ({ 
  value, 
  onChange, 
  options, 
  isDark, 
  placeholder 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: [string, string][], 
  isDark: boolean,
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(([k]) => k === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 rounded-xl border text-base cursor-pointer flex items-center justify-between transition-colors shadow-sm ${
          isDark 
            ? "bg-slate-800/60 border-slate-700 hover:border-teal-500/50 text-slate-100" 
            : "bg-white/80 border-slate-200 hover:border-teal-500/50 text-slate-800 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center gap-3 font-semibold">
          {value ? (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <DepartmentIcon department={value} />
              </div>
              <span className="truncate">{selectedOption ? selectedOption[1] : value}</span>
            </>
          ) : (
            <span className={isDark ? "text-slate-400 font-normal" : "text-slate-500 font-normal"}>{placeholder}</span>
          )}
        </div>
        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-500" : (isDark ? "text-slate-400" : "text-slate-500")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[110] w-full mt-2 rounded-xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto ${
              isDark ? "bg-slate-800 border-slate-700 shadow-slate-900/50" : "bg-white border-slate-200 shadow-slate-200/50"
            }`}
          >
            {options.map(([key, val]) => (
              <div
                key={key}
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  value === key 
                    ? (isDark ? "bg-teal-500/20 text-teal-400" : "bg-teal-50 text-teal-700") 
                    : (isDark ? "hover:bg-slate-700/50 text-slate-200" : "hover:bg-slate-50 text-slate-700")
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center opacity-80">
                  <DepartmentIcon department={key} />
                </div>
                <span className="font-medium text-sm sm:text-base">{val}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
"""
    content = content[:import_index] + custom_dropdown_code + "\n" + content[import_index:]
    
    # 4. Replace native <select> with CustomDepartmentSelect
    select_regex = r'<select\s+id="indDepartment"[\s\S]*?</select>'
    select_replacement = """<CustomDepartmentSelect
                          value={indDepartment}
                          onChange={setIndDepartment}
                          options={Object.entries(t.locations)}
                          isDark={isDark}
                          placeholder={`-- ${t.locationSelect} --`}
                        />"""
    content = re.sub(select_regex, select_replacement, content)
    
    # 5. Upgrade form styling variables
    # const inputBg = ... -> glassmorphic style
    inputBg_target = 'const inputBg = isDark\n    ? "bg-slate-800/60 border-slate-700 focus:border-teal-500 text-slate-100 placeholder:text-slate-400"\n    : "bg-[#fbfdfd] border-slate-200 focus:border-teal-600 text-slate-800 placeholder:text-slate-400 focus:ring-teal-500/10";'
    inputBg_new = 'const inputBg = isDark\n    ? "bg-slate-800/40 border-slate-700/80 focus:border-teal-500 text-slate-100 placeholder:text-slate-400 shadow-inner backdrop-blur-sm"\n    : "bg-white/80 border-slate-200/80 focus:border-teal-500 text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-teal-500/10 shadow-sm backdrop-blur-sm";'
    content = content.replace(inputBg_target, inputBg_new)
    
    formInput_target = 'const formInput = `w-full px-4 py-3.5 rounded-xl border text-base focus:outline-none transition-colors ${inputBg}`;'
    formInput_new = 'const formInput = `w-full px-4 py-3.5 rounded-xl border text-base focus:outline-none transition-all duration-200 ${inputBg}`;'
    content = content.replace(formInput_target, formInput_new)

    # 6. Make individual complaint boxes matching the glassmorphic modal
    ind_target_1 = 'bg-slate-900/20 border-slate-700'
    ind_new_1 = 'bg-slate-800/40 border-slate-700/80 backdrop-blur-md shadow-lg shadow-slate-900/20'
    content = content.replace(ind_target_1, ind_new_1)

    ind_target_2 = 'bg-slate-50/50 border-slate-200'
    ind_new_2 = 'bg-white/60 border-slate-200/80 backdrop-blur-md shadow-lg shadow-slate-200/50'
    content = content.replace(ind_target_2, ind_new_2)
    
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
refactor()
