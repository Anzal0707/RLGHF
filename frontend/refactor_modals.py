import re

def refactor_modals(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for Modal 1
    pattern1 = re.compile(
        r'<AnimatePresence>\s*\{isModalOpen && \(\s*<motion\.div[^>]*?className="fixed inset-0 z-\[100\][^>]*?onClick=\{\(\) => \{ setIsModalOpen\(false\); setTimeout\(\(\) => setDepartment\(""\), 300\); \}\}\s*>\s*<motion\.div[^>]*?className=\{`relative w-full max-w-2xl max-h-\[90vh\].*?onClick=\{\(e\) => e\.stopPropagation\(\)\}\s*>',
        re.DOTALL
    )
    # Replacement for Modal 1
    repl1 = '<UnifiedModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setTimeout(() => setDepartment(""), 300); }} isDark={isDark}>'

    # Pattern for Modal 2
    pattern2 = re.compile(
        r'<AnimatePresence>\s*\{isIndividualModalOpen && \(\s*<motion\.div[^>]*?className="fixed inset-0 z-\[100\][^>]*?onClick=\{\(\) => setIsIndividualModalOpen\(false\)\}\s*>\s*<motion\.div[^>]*?className=\{`relative w-full max-w-2xl max-h-\[90vh\].*?onClick=\{\(e\) => e\.stopPropagation\(\)\}\s*>',
        re.DOTALL
    )
    # Replacement for Modal 2
    repl2 = '<UnifiedModal isOpen={isIndividualModalOpen} onClose={() => setIsIndividualModalOpen(false)} isDark={isDark}>'

    # Pattern for Modal 3
    pattern3 = re.compile(
        r'<AnimatePresence>\s*\{isComplaintTypeModalOpen && \(\s*<motion\.div[^>]*?className="fixed inset-0 z-\[100\][^>]*?onClick=\{\(\) => setIsComplaintTypeModalOpen\(false\)\}\s*>\s*<motion\.div[^>]*?className=\{`relative w-full max-w-2xl max-h-\[90vh\].*?onClick=\{\(e\) => e\.stopPropagation\(\)\}\s*>',
        re.DOTALL
    )
    # Replacement for Modal 3
    repl3 = '<UnifiedModal isOpen={isComplaintTypeModalOpen} onClose={() => setIsComplaintTypeModalOpen(false)} isDark={isDark}>'

    # Replace open tags
    content = pattern1.sub(repl1, content)
    content = pattern2.sub(repl2, content)
    content = pattern3.sub(repl3, content)

    # Now replace closing tags for each UnifiedModal block
    # We will just replace </motion.div>\s*</motion.div>\s*\)\}\s*</AnimatePresence> 
    # with </UnifiedModal> 
    # globally, since these are the only modals we modified. But we must be careful not to replace other AnimatePresence.
    # Actually, we can count the number of </AnimatePresence> and be more specific.
    closing_pattern = re.compile(
        r'</motion\.div>\s*</motion\.div>\s*\)\}\s*</AnimatePresence>',
        re.DOTALL
    )
    content = closing_pattern.sub('</UnifiedModal>', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    refactor_modals('c:\\Users\\aavas\\rlg-complaint-system\\frontend\\app\\page.tsx')
