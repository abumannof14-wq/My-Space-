        // Application State
        let appState = {
            authenticated: false,
            currentPage: 'dashboard',
            items: JSON.parse(localStorage.getItem('greencore_items')) || [],
            systemActive: true,
            securityLevel: 100, // 100% dan boshlansin
            currentSearchTerm: '',
            account: JSON.parse(localStorage.getItem('greencore_account')) || {
                name: "Administrator",
                id: "a1uz_2014",
                email: "admin@greencore.local",
                password: "@Abdumannof@",
                avatar: "https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&size=128&bold=true"
            },
            resetCode: null,
            resetEmail: null,
            lastItemCount: 0,
            securityPenaltyApplied: false
        };

        // DOM Elements
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        const logoutBtn = document.getElementById('logoutBtn');
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const securityAlert = document.getElementById('securityAlert');
        const criticalProgressBar = document.getElementById('criticalProgressBar');
        const criticalLevelText = document.getElementById('criticalLevelText');
        const dismissAlert = document.getElementById('dismissAlert');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const closeMobileMenu = document.getElementById('closeMobileMenu');
        const mobileSystemStatus = document.getElementById('mobileSystemStatus');

        // Password Reset Elements
        const passwordResetModal = document.getElementById('passwordResetModal');
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        const closeResetModal = document.getElementById('closeResetModal');
        const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
        const backToEmailBtn = document.getElementById('backToEmailBtn');
        const verifyCodeBtn = document.getElementById('verifyCodeBtn');
        const backToCodeBtn = document.getElementById('backToCodeBtn');
        const saveNewPasswordBtn = document.getElementById('saveNewPasswordBtn');
        const resetSteps = document.querySelectorAll('.reset-step');

        // Page Containers
        const dashboardPage = document.getElementById('dashboardPage');
        const dataPage = document.getElementById('dataPage');
        const securityPage = document.getElementById('securityPage');
        const accountPage = document.getElementById('accountPage');

        // Search Elements
        const globalSearchInput = document.getElementById('globalSearchInput');

        // Dashboard Elements
        const totalItemsCount = document.getElementById('totalItemsCount');
        const securityLevelText = document.getElementById('securityLevelText');
        const securityProgressBar = document.getElementById('securityProgressBar');
        const systemStatusDisplay = document.getElementById('systemStatusDisplay');
        const systemStatusBadge = document.getElementById('systemStatusBadge');
        const systemStatusText = document.getElementById('systemStatusText');
        const dashboardItemsGrid = document.getElementById('dashboardItemsGrid');
        const itemsCountDisplay = document.getElementById('itemsCountDisplay');

        // Data Page Elements
        const itemForm = document.getElementById('itemForm');
        const itemImageInput = document.getElementById('itemImage');
        const imagePreview = document.getElementById('imagePreview');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const recentItemsList = document.getElementById('recentItemsList');
        const recentCount = document.getElementById('recentCount');
        const viewAllItemsBtn = document.getElementById('viewAllItemsBtn');
        const clearItemsBtn = document.getElementById('clearItemsBtn');
        const dataTotalItems = document.getElementById('dataTotalItems');
        const itemsWithImages = document.getElementById('itemsWithImages');
        const lastCreatedDate = document.getElementById('lastCreatedDate');

        // Security Page Elements
        const consoleOutput = document.getElementById('consoleOutput');
        const clearConsoleBtn = document.getElementById('clearConsoleBtn');
        const addTestLogBtn = document.getElementById('addTestLogBtn');
        const stopSystemBtn = document.getElementById('stopSystemBtn');
        const runSecurityScanBtn = document.getElementById('runSecurityScanBtn');
        const securityLogs = document.getElementById('securityLogs');
        const securityPageProgress = document.getElementById('securityPageProgress');

        // Account Page Elements
        const profileForm = document.getElementById('profileForm');
        const accountNameInput = document.getElementById('accountName');
        const accountIdInput = document.getElementById('accountId');
        const accountEmailInput = document.getElementById('accountEmail');
        const accountAvatar = document.getElementById('accountAvatar');
        const accountDisplayName = document.getElementById('accountDisplayName');
        const passwordForm = document.getElementById('passwordForm');
        const passwordError = document.getElementById('passwordError');
        const passwordErrorText = document.getElementById('passwordErrorText');
        const passwordSuccess = document.getElementById('passwordSuccess');
        const profileSuccess = document.getElementById('profileSuccess');
        const profileError = document.getElementById('profileError');

        // Modal Elements
        const allItemsModal = document.getElementById('allItemsModal');
        const modalTotalItems = document.getElementById('modalTotalItems');
        const allItemsTable = document.getElementById('allItemsTable');
        const closeModal = document.getElementById('closeModal');
        const closeModalBottom = document.getElementById('closeModalBottom');

        // Initialize App
        function initApp() {
            showLoginScreen();
            updateDashboard();
            updateDataPage();
            updateAccountPage();
            updateSecurityLevel();
            setInterval(addSecurityLog, 15000);
            setupEventListeners();
        }

        // Update Security Level Function
        function updateSecurityLevel() {
            const itemsCount = appState.items.length;
            let newSecurityLevel = appState.securityLevel;
            
            if (!appState.systemActive) {
                newSecurityLevel = 30;
            } else {
                // Har 50 ta item uchun 2% pasaytirish
                if (itemsCount > appState.lastItemCount) {
                    // Item qo'shilganda
                    if (itemsCount >= 50) {
                        const penaltyMultiplier = Math.floor(itemsCount / 50);
                        const penalty = penaltyMultiplier * 2;
                        newSecurityLevel = Math.max(0, 100 - penalty);
                        
                        if (penalty > 0 && !appState.securityPenaltyApplied) {
                            addConsoleLog(`⚠️ WARNING: Number of items reached ${itemsCount}. Security level decreased by ${penalty}%!`, 'red');
                            addSecurityLogEntry(`Security level decreased: ${itemsCount} items`);
                            appState.securityPenaltyApplied = true;
                        }
                    }
                } else if (itemsCount < appState.lastItemCount) {
                    // Item o'chirilganda
                    if (itemsCount < 50) {
                        newSecurityLevel = Math.min(100, appState.securityLevel + 2);
                        
                        if (newSecurityLevel > appState.securityLevel) {
                            addConsoleLog(`✅ Number of items reduced to ${itemsCount}. Security level increased by 2%.`, 'green');
                            addSecurityLogEntry(`Security level increased: ${itemsCount} items`);
                        }
                    }
                }
            }
            
            appState.lastItemCount = itemsCount;
            appState.securityLevel = newSecurityLevel;
            updateSecurityUI();
            
            // 20% dan past bo'lsa, xabar chiqaramiz
            if (appState.securityLevel <= 20) {
                showSecurityAlert();
                addConsoleLog('🚨 CRITICAL: Security level is too low! Please reduce dashboard items immediately!', 'red');
                addSecurityLogEntry('CRITICAL: Security level is too low');
            } else {
                hideSecurityAlert();
            }
        }

        // Show Security Alert
        function showSecurityAlert() {
            securityAlert.classList.remove('hidden');
            criticalProgressBar.style.width = appState.securityLevel + '%';
            criticalLevelText.textContent = appState.securityLevel + '%';
        }

        // Hide Security Alert
        function hideSecurityAlert() {
            securityAlert.classList.add('hidden');
        }

        // Update Security UI Function
        function updateSecurityUI() {
            const level = appState.securityLevel;
            
            securityLevelText.textContent = `${level}%`;
            securityProgressBar.style.width = `${level}%`;
            securityPageProgress.style.width = `${level}%`;
            
            if (level > 70) {
                securityProgressBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
                securityPageProgress.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
                systemStatusDisplay.textContent = 'ACTIVE';
                systemStatusText.textContent = 'ACTIVE';
                mobileSystemStatus.textContent = 'ACTIVE';
                systemStatusBadge.className = 'status-active px-3 py-1 rounded-full text-xs font-medium inline-block';
                systemStatusBadge.textContent = 'OPERATIONAL';
            } else if (level > 40) {
                securityProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                securityPageProgress.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                systemStatusDisplay.textContent = 'WARNING';
                systemStatusText.textContent = 'WARNING';
                mobileSystemStatus.textContent = 'WARNING';
                systemStatusBadge.className = 'status-warning px-3 py-1 rounded-full text-xs font-medium inline-block';
                systemStatusBadge.textContent = 'WARNING';
            } else if (level > 20) {
                securityProgressBar.style.background = 'linear-gradient(90deg, #ea580c, #f97316)';
                securityPageProgress.style.background = 'linear-gradient(90deg, #ea580c, #f97316)';
                systemStatusDisplay.textContent = 'DANGER';
                systemStatusText.textContent = 'DANGER';
                mobileSystemStatus.textContent = 'DANGER';
                systemStatusBadge.className = 'status-danger px-3 py-1 rounded-full text-xs font-medium inline-block';
                systemStatusBadge.textContent = 'DANGER';
            } else {
                securityProgressBar.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
                securityPageProgress.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
                systemStatusDisplay.textContent = 'CRITICAL';
                systemStatusText.textContent = 'CRITICAL';
                mobileSystemStatus.textContent = 'CRITICAL';
                systemStatusBadge.className = 'status-critical px-3 py-1 rounded-full text-xs font-medium inline-block';
                systemStatusBadge.textContent = 'CRITICAL';
            }
            
            totalItemsCount.textContent = appState.items.length;
            itemsCountDisplay.textContent = `${appState.items.length} ${appState.items.length === 1 ? 'item' : 'items'}`;
        }

        // Password Reset Functions
        function showResetStep(stepNumber) {
            resetSteps.forEach(step => {
                step.classList.remove('active');
            });
            document.getElementById(`resetStep${stepNumber}`).classList.add('active');
        }

        function generateVerificationCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }

        // Setup Event Listeners
        function setupEventListeners() {
            // Login Form Handler
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const systemId = document.getElementById('systemId').value;
                const password = document.getElementById('password').value;
                
                if (systemId === 'a1uz_2014' && password === appState.account.password) {
                    appState.authenticated = true;
                    loginError.classList.add('hidden');
                    showMainApp();
                } else {
                    loginError.classList.remove('hidden');
                    loginForm.classList.add('shake');
                    setTimeout(() => {
                        loginForm.classList.remove('shake');
                    }, 500);
                }
            });
            
            // Mobile Menu
            mobileMenuBtn.addEventListener('click', function() {
                mobileSidebar.classList.remove('-translate-x-full');
            });
            
            closeMobileMenu.addEventListener('click', function() {
                mobileSidebar.classList.add('-translate-x-full');
            });
            
            // Dismiss Alert
            dismissAlert.addEventListener('click', function() {
                securityAlert.classList.add('hidden');
            });
            
            // Forgot Password Button
            forgotPasswordBtn.addEventListener('click', function() {
                passwordResetModal.classList.remove('hidden');
                showResetStep(1);
                document.getElementById('resetEmail').value = '';
                document.getElementById('verifyCode').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
                
                document.getElementById('resetEmailError').classList.add('hidden');
                document.getElementById('codeError').classList.add('hidden');
                document.getElementById('passwordResetError').classList.add('hidden');
                document.getElementById('passwordResetSuccess').classList.add('hidden');
            });
            
            // Close Reset Modal
            closeResetModal.addEventListener('click', function() {
                passwordResetModal.classList.add('hidden');
            });
            
            // Send Reset Code
            sendResetCodeBtn.addEventListener('click', function() {
                const email = document.getElementById('resetEmail').value.trim();
                const emailError = document.getElementById('resetEmailError');
                const emailErrorText = document.getElementById('resetEmailErrorText');
                
                if (email !== 'abumannof14@gmail.com') {
                    emailErrorText.textContent = 'This is a gmail error, please enter another gmail.';
                    emailError.classList.remove('hidden');
                    return;
                }
                
                appState.resetCode = generateVerificationCode();
                appState.resetEmail = email;
                
                document.getElementById('verificationCodeDisplay').textContent = appState.resetCode;
                document.getElementById('sentToEmail').textContent = email;
                
                showResetStep(2);
                emailError.classList.add('hidden');
                
                addConsoleLog(`Password reset code generated: ${appState.resetCode}`, 'blue');
                addSecurityLogEntry('Password reset code generated');
            });
            
            // Back to Email step
            backToEmailBtn.addEventListener('click', function() {
                showResetStep(1);
            });
            
            // Verify Code
            verifyCodeBtn.addEventListener('click', function() {
                const enteredCode = document.getElementById('verifyCode').value.trim();
                
                if (enteredCode === appState.resetCode) {
                    showResetStep(3);
                    document.getElementById('codeError').classList.add('hidden');
                    
                    addConsoleLog('Password reset code verified', 'green');
                    addSecurityLogEntry('Password reset code verified');
                } else {
                    document.getElementById('codeError').classList.remove('hidden');
                    addConsoleLog('Invalid password reset code entered', 'red');
                }
            });
            
            // Back to Code step
            backToCodeBtn.addEventListener('click', function() {
                showResetStep(2);
            });
            
            // Save New Password
            saveNewPasswordBtn.addEventListener('click', function() {
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmNewPassword').value;
                const passwordError = document.getElementById('passwordResetError');
                const passwordErrorText = document.getElementById('passwordResetErrorText');
                const passwordSuccess = document.getElementById('passwordResetSuccess');
                
                if (!newPassword || !confirmPassword) {
                    passwordErrorText.textContent = 'Please enter both password fields!';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                if (newPassword.length < 6) {
                    passwordErrorText.textContent = 'Password must be at least 6 characters!';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    passwordErrorText.textContent = 'Passwords do not match!';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                appState.account.password = newPassword;
                localStorage.setItem('greencore_account', JSON.stringify(appState.account));
                
                passwordError.classList.add('hidden');
                passwordSuccess.classList.remove('hidden');
                
                addConsoleLog('Password reset successful', 'green');
                addSecurityLogEntry('Password reset successful');
                
                setTimeout(() => {
                    passwordResetModal.classList.add('hidden');
                    document.getElementById('systemId').value = 'a1uz_2014';
                    document.getElementById('password').value = newPassword;
                }, 2000);
            });
            
            // Logout Handler
            logoutBtn.addEventListener('click', function() {
                appState.authenticated = false;
                appState.currentPage = 'dashboard';
                showLoginScreen();
                addConsoleLog('User logged out', 'red');
            });
            
            // Sidebar Navigation
            sidebarItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const page = this.getAttribute('data-page');
                    navigateTo(page);
                    // Mobile menyuni yopish
                    mobileSidebar.classList.add('-translate-x-full');
                });
            });
            
            // Global Search Functionality
            if (globalSearchInput) {
                globalSearchInput.addEventListener('input', function() {
                    appState.currentSearchTerm = this.value;
                    updateDashboard();
                    updateDataPage();
                });
            }
            
            // Image Preview for Data Page
            itemImageInput.addEventListener('input', function() {
                const url = this.value.trim();
                if (url) {
                    imagePreview.src = url;
                    imagePreviewContainer.style.display = 'block';
                    
                    imagePreview.onerror = function() {
                        imagePreviewContainer.style.display = 'none';
                        itemImageInput.classList.add('border-red-500');
                        setTimeout(() => {
                            itemImageInput.classList.remove('border-red-500');
                        }, 2000);
                    };
                    
                    imagePreview.onload = function() {
                        itemImageInput.classList.remove('border-red-500');
                        itemImageInput.classList.add('border-green-500');
                    };
                } else {
                    imagePreviewContainer.style.display = 'none';
                }
            });
            
            // Item Form Handler
            itemForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('itemName').value;
                const about = document.getElementById('itemAbout').value;
                const image = document.getElementById('itemImage').value;
                
                if (!name.trim() || !about.trim()) {
                    alert('Name and About fields are required!');
                    return;
                }
                
                const newItem = {
                    id: Date.now(),
                    name,
                    about,
                    image,
                    date: new Date().toISOString()
                };
                
                appState.items.unshift(newItem);
                saveItems();
                
                itemForm.reset();
                imagePreviewContainer.style.display = 'none';
                
                updateDashboard();
                updateDataPage();
                
                addConsoleLog(`Item "${name}" created successfully`, 'green');
                addSecurityLogEntry(`New item created: ${name}`);
                
                updateSecurityLevel();
            });
            
            // View All Items Modal
            viewAllItemsBtn.addEventListener('click', function() {
                modalTotalItems.textContent = appState.items.length;
                updateAllItemsTable();
                allItemsModal.classList.remove('hidden');
                addConsoleLog('Viewing all items', 'blue');
            });
            
            // Clear All Items
            clearItemsBtn.addEventListener('click', function() {
                if (appState.items.length === 0) {
                    alert('No items to clear.');
                    return;
                }
                
                if (confirm(`Are you sure you want to delete all ${appState.items.length} items? This action cannot be undone.`)) {
                    appState.items = [];
                    saveItems();
                    updateDashboard();
                    updateDataPage();
                    
                    addConsoleLog('All items cleared', 'red');
                    addSecurityLogEntry('All items cleared from database');
                    
                    updateSecurityLevel();
                    appState.lastItemCount = 0;
                }
            });
            
            // Close Modal
            closeModal.addEventListener('click', function() {
                allItemsModal.classList.add('hidden');
            });
            
            closeModalBottom.addEventListener('click', function() {
                allItemsModal.classList.add('hidden');
            });
            
            // Security Page Functions
            clearConsoleBtn.addEventListener('click', function() {
                consoleOutput.innerHTML = '<div class="text-green-400 mb-2">> Console cleared</div>';
                addConsoleLog('System ready', 'green');
                addSecurityLogEntry('Console cleared by user');
            });
            
            addTestLogBtn.addEventListener('click', function() {
                const testMessages = [
                    'Test log entry generated',
                    'Security check: All systems operational',
                    'Database connection verified',
                    'User permissions validated',
                    'Network traffic analysis completed'
                ];
                
                const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
                addConsoleLog(randomMessage, 'blue');
                addSecurityLogEntry(randomMessage);
            });
            
            // Stop System
            stopSystemBtn.addEventListener('click', function() {
                if (appState.systemActive) {
                    appState.systemActive = false;
                    addConsoleLog('SYSTEM STOPPED - All operations halted', 'red');
                    addSecurityLogEntry('SYSTEM STOPPED by user');
                } else {
                    appState.systemActive = true;
                    addConsoleLog('System restarted successfully', 'green');
                    addSecurityLogEntry('System restarted by user');
                }
                updateSecurityLevel();
            });
            
            // Run Security Scan
            runSecurityScanBtn.addEventListener('click', function() {
                addConsoleLog('Running full security scan...', 'blue');
                addSecurityLogEntry('Full security scan initiated');
                
                setTimeout(() => {
                    addConsoleLog('Security scan completed: No threats detected', 'green');
                    addSecurityLogEntry('Security scan completed - No threats');
                    
                    const currentLevel = appState.securityLevel;
                    const newLevel = Math.min(100, currentLevel + 5);
                    if (newLevel > currentLevel) {
                        appState.securityLevel = newLevel;
                        updateSecurityUI();
                        addConsoleLog(`Security level increased to ${newLevel}%`, 'green');
                    }
                }, 1500);
            });
            
            // Account Page Functions
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = accountNameInput.value;
                const email = accountEmailInput.value;
                
                if (!name.trim()) {
                    document.getElementById('profileErrorText').textContent = 'Name is required';
                    profileError.classList.remove('hidden');
                    profileSuccess.classList.add('hidden');
                    return;
                }
                
                if (!email.trim() || !email.includes('@')) {
                    document.getElementById('profileErrorText').textContent = 'Valid email is required';
                    profileError.classList.remove('hidden');
                    profileSuccess.classList.add('hidden');
                    return;
                }
                
                appState.account.name = name;
                appState.account.email = email;
                appState.account.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=128&bold=true`;
                
                localStorage.setItem('greencore_account', JSON.stringify(appState.account));
                
                updateAccountPage();
                
                profileSuccess.classList.remove('hidden');
                profileError.classList.add('hidden');
                
                setTimeout(() => {
                    profileSuccess.classList.add('hidden');
                }, 3000);
                
                addConsoleLog('Profile information updated', 'green');
                addSecurityLogEntry('User profile updated');
            });
            
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                passwordError.classList.add('hidden');
                passwordSuccess.classList.add('hidden');
                
                if (currentPassword !== appState.account.password) {
                    passwordErrorText.textContent = 'Current password is incorrect';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    passwordErrorText.textContent = 'New passwords do not match';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                if (newPassword.length < 6) {
                    passwordErrorText.textContent = 'New password must be at least 6 characters';
                    passwordError.classList.remove('hidden');
                    return;
                }
                
                appState.account.password = newPassword;
                localStorage.setItem('greencore_account', JSON.stringify(appState.account));
                
                passwordSuccess.classList.remove('hidden');
                passwordForm.reset();
                
                addConsoleLog('Password changed successfully', 'green');
                addSecurityLogEntry('User password changed');
                
                setTimeout(() => {
                    passwordSuccess.classList.add('hidden');
                }, 3000);
            });
        }

        // Login Screen
        function showLoginScreen() {
            loginScreen.classList.remove('hidden');
            mainApp.classList.add('hidden');
            
            document.getElementById('systemId').value = '';
            document.getElementById('password').value = '';
            loginError.classList.add('hidden');
            
            if (passwordResetModal && !passwordResetModal.classList.contains('hidden')) {
                passwordResetModal.classList.add('hidden');
            }
            
            if (allItemsModal && !allItemsModal.classList.contains('hidden')) {
                allItemsModal.classList.add('hidden');
            }
            
            // Mobile menyuni yopish
            if (mobileSidebar) {
                mobileSidebar.classList.add('-translate-x-full');
            }
        }

        // Main App
        function showMainApp() {
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            navigateTo(appState.currentPage);
            
            addConsoleLog('User authentication successful', 'green');
            addSecurityLogEntry('User authentication successful');
        }

        // Navigation
        function navigateTo(page) {
            appState.currentPage = page;
            
            sidebarItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-page') === page) {
                    item.classList.add('active');
                }
            });
            
            document.querySelectorAll('.page-content').forEach(pageEl => {
                pageEl.classList.add('hidden');
            });
            
            document.getElementById(page + 'Page').classList.remove('hidden');
            
            const pageTitles = {
                dashboard: 'Dashboard',
                data: 'Data Management',
                security: 'Security Center',
                account: 'Account Settings'
            };
            
            const pageSubtitles = {
                dashboard: 'System Overview',
                data: 'Create and Manage Items',
                security: 'System Console and Controls',
                account: 'Profile and Security'
            };
            
            pageTitle.textContent = pageTitles[page];
            pageSubtitle.textContent = pageSubtitles[page];
            
            if (page === 'account') {
                updateAccountPage();
            }
            
            if (page !== 'dashboard') {
                addConsoleLog(`Navigated to ${pageTitles[page]}`, 'blue');
            }
        }

        // Edit Item
        function editItem(id) {
            const item = appState.items.find(item => item.id === id);
            if (!item) return;
            
            const newName = prompt('Enter new name:', item.name);
            if (newName && newName.trim() !== '') {
                const newAbout = prompt('Enter new description:', item.about);
                const newImage = prompt('Enter new image URL:', item.image);
                
                item.name = newName.trim();
                item.about = newAbout ? newAbout.trim() : item.about;
                item.image = newImage ? newImage.trim() : item.image;
                
                saveItems();
                updateDashboard();
                updateDataPage();
                
                addConsoleLog(`Item "${item.name}" updated`, 'blue');
                addSecurityLogEntry(`Item updated: ${item.name}`);
                
                updateSecurityLevel();
            }
        }

        // Delete Item
        function deleteItem(id) {
            const item = appState.items.find(item => item.id === id);
            if (!item) return;
            
            if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                appState.items = appState.items.filter(item => item.id !== id);
                saveItems();
                updateDashboard();
                updateDataPage();
                
                addConsoleLog(`Item "${item.name}" deleted`, 'red');
                addSecurityLogEntry(`Item deleted: ${item.name}`);
                
                updateSecurityLevel();
            }
        }

        // Save items to localStorage
        function saveItems() {
            localStorage.setItem('greencore_items', JSON.stringify(appState.items));
        }

        // Highlight search term in text
        function highlightText(text, searchTerm) {
            if (!searchTerm || !text) return text;
            
            try {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                return text.replace(regex, '<span class="search-highlight">$1</span>');
            } catch (e) {
                return text;
            }
        }

        // Update Dashboard
        function updateDashboard() {
            totalItemsCount.textContent = appState.items.length;
            itemsCountDisplay.textContent = `${appState.items.length} ${appState.items.length === 1 ? 'item' : 'items'}`;
            dashboardItemsGrid.innerHTML = '';
            
            if (appState.items.length === 0) {
                dashboardItemsGrid.innerHTML = `
                    <div class="col-span-2 text-center py-8 md:py-12 text-gray-500">
                        <i class="fas fa-cube text-3xl md:text-4xl mb-3 md:mb-4"></i>
                        <p>No items created yet. Go to the Data page to create your first item.</p>
                    </div>
                `;
            } else {
                let filteredItems = appState.items;
                if (appState.currentSearchTerm.trim() !== '') {
                    const searchTerm = appState.currentSearchTerm.toLowerCase();
                    filteredItems = appState.items.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) || 
                        item.about.toLowerCase().includes(searchTerm)
                    );
                }
                
                if (filteredItems.length === 0) {
                    dashboardItemsGrid.innerHTML = `
                        <div class="col-span-2 text-center py-8 md:py-12 text-gray-500">
                            <i class="fas fa-search text-3xl md:text-4xl mb-3 md:mb-4"></i>
                            <p>No items found matching "${appState.currentSearchTerm}"</p>
                            <p class="text-sm mt-2">Try a different search term or clear the search</p>
                        </div>
                    `;
                } else {
                    filteredItems.slice(0, 8).forEach(item => {
                        const date = new Date(item.date);
                        const dateString = date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        const highlightedName = highlightText(item.name, appState.currentSearchTerm);
                        const highlightedAbout = highlightText(item.about, appState.currentSearchTerm);
                        
                        const itemElement = document.createElement('div');
                        itemElement.className = 'item-card bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-700';
                        
                        let imageSection = '';
                        if (item.image && item.image.trim() !== '') {
                            imageSection = `
                                <div class="mb-3 md:mb-4">
                                    <img src="${item.image}" alt="${item.name}" class="w-full h-32 md:h-40 object-cover rounded-lg">
                                </div>
                            `;
                        }
                        
                        itemElement.innerHTML = `
                            ${imageSection}
                            <div class="flex justify-between items-start mb-2 md:mb-3">
                                <h4 class="text-blue-400 font-bold text-base md:text-lg">${highlightedName}</h4>
                                <span class="text-yellow-400 text-xs md:text-sm">${dateString}</span>
                            </div>
                            <p class="text-gray-300 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">${highlightedAbout}</p>
                            <div class="flex justify-between items-center">
                                <div>
                                    ${item.image ? 
                                        `<span class="text-green-400 text-xs"><i class="fas fa-image mr-1"></i> Has Image</span>` : 
                                        `<span class="text-gray-500 text-xs"><i class="fas fa-image mr-1"></i> No Image</span>`
                                    }
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="editItem(${item.id})" class="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                                        Edit
                                    </button>
                                    <button onclick="deleteItem(${item.id})" class="px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        dashboardItemsGrid.appendChild(itemElement);
                    });
                    
                    if (appState.currentSearchTerm.trim() !== '') {
                        const resultsCount = document.createElement('div');
                        resultsCount.className = 'col-span-2 text-center text-gray-400 text-sm mt-4';
                        resultsCount.textContent = `Showing ${filteredItems.length} of ${appState.items.length} items`;
                        dashboardItemsGrid.appendChild(resultsCount);
                    }
                }
            }
        }

        // Update Data Page
        function updateDataPage() {
            recentItemsList.innerHTML = '';
            
            if (appState.items.length === 0) {
                recentItemsList.innerHTML = `
                    <div class="text-center py-6 md:py-8 text-gray-500">
                        <i class="fas fa-cube text-2xl md:text-3xl mb-2 md:mb-3"></i>
                        <p>No items created yet. Create your first item!</p>
                    </div>
                `;
            } else {
                let itemsToShow = appState.items;
                
                if (appState.currentSearchTerm.trim() !== '') {
                    const searchTerm = appState.currentSearchTerm.toLowerCase();
                    itemsToShow = appState.items.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) || 
                        item.about.toLowerCase().includes(searchTerm)
                    );
                }
                
                if (itemsToShow.length === 0) {
                    recentItemsList.innerHTML = `
                        <div class="text-center py-6 md:py-8 text-gray-500">
                            <i class="fas fa-search text-2xl md:text-3xl mb-2 md:mb-3"></i>
                            <p>No items found matching "${appState.currentSearchTerm}"</p>
                        </div>
                    `;
                } else {
                    itemsToShow.slice(0, 5).forEach(item => {
                        const date = new Date(item.date);
                        const timeAgo = getTimeAgo(date);
                        
                        const highlightedName = highlightText(item.name, appState.currentSearchTerm);
                        const highlightedAbout = highlightText(item.about, appState.currentSearchTerm);
                        
                        const itemElement = document.createElement('div');
                        itemElement.className = 'item-card bg-gray-700/50 rounded-lg p-3 md:p-4';
                        
                        let imageSection = '';
                        if (item.image && item.image.trim() !== '') {
                            imageSection = `
                                <div class="mr-3 md:mr-4 flex-shrink-0">
                                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg">
                                </div>
                            `;
                        }
                        
                        itemElement.innerHTML = `
                            <div class="flex">
                                ${imageSection}
                                <div class="flex-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="text-blue-400 font-semibold text-sm md:text-base">${highlightedName}</h4>
                                        <span class="text-yellow-400 text-xs md:text-sm">${timeAgo}</span>
                                    </div>
                                    <p class="text-gray-300 text-xs md:text-sm mt-1 md:mt-2 mb-2 md:mb-3 line-clamp-2">${highlightedAbout}</p>
                                    <div class="flex justify-end space-x-2">
                                        <button onclick="editItem(${item.id})" class="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                                            <i class="fas fa-edit mr-1"></i> Edit
                                        </button>
                                        <button onclick="deleteItem(${item.id})" class="px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">
                                            <i class="fas fa-trash-alt mr-1"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        recentItemsList.appendChild(itemElement);
                    });
                    
                    if (appState.currentSearchTerm.trim() !== '') {
                        const resultsCount = document.createElement('div');
                        resultsCount.className = 'text-center text-gray-400 text-sm mt-4';
                        resultsCount.textContent = `Showing ${Math.min(itemsToShow.length, 5)} of ${itemsToShow.length} matching items`;
                        recentItemsList.appendChild(resultsCount);
                    }
                }
            }
            
            const totalItems = appState.items.length;
            recentCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
            dataTotalItems.textContent = totalItems;
            
            const itemsWithImagesCount = appState.items.filter(item => item.image && item.image.trim() !== '').length;
            itemsWithImages.textContent = itemsWithImagesCount;
            
            if (appState.items.length > 0) {
                const lastItem = appState.items[0];
                const lastDate = new Date(lastItem.date);
                lastCreatedDate.textContent = lastDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                lastCreatedDate.textContent = 'Never';
            }
        }

        // Update Account Page
        function updateAccountPage() {
            accountNameInput.value = appState.account.name;
            accountIdInput.value = appState.account.id;
            accountEmailInput.value = appState.account.email;
            
            accountAvatar.src = appState.account.avatar;
            accountDisplayName.textContent = appState.account.name;
        }

        // Update All Items Table
        function updateAllItemsTable() {
            allItemsTable.innerHTML = '';
            
            if (appState.items.length === 0) {
                allItemsTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-8 text-center text-gray-500">
                            <i class="fas fa-cube text-xl md:text-2xl mb-2 block"></i>
                            <p>No items created yet.</p>
                        </td>
                    </tr>
                `;
            } else {
                let itemsToShow = appState.items;
                
                if (appState.currentSearchTerm.trim() !== '') {
                    const searchTerm = appState.currentSearchTerm.toLowerCase();
                    itemsToShow = appState.items.filter(item => 
                        item.name.toLowerCase().includes(searchTerm) || 
                        item.about.toLowerCase().includes(searchTerm)
                    );
                }
                
                if (itemsToShow.length === 0) {
                    allItemsTable.innerHTML = `
                        <tr>
                            <td colspan="5" class="py-8 text-center text-gray-500">
                                <i class="fas fa-search text-xl md:text-2xl mb-2 block"></i>
                                <p>No items found matching "${appState.currentSearchTerm}"</p>
                            </td>
                        </tr>
                    `;
                } else {
                    itemsToShow.forEach(item => {
                        const date = new Date(item.date);
                        const dateString = date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        const highlightedName = highlightText(item.name, appState.currentSearchTerm);
                        const highlightedAbout = highlightText(item.about, appState.currentSearchTerm);
                        
                        const row = document.createElement('tr');
                        row.className = 'border-b border-gray-700 hover:bg-gray-700/30';
                        row.innerHTML = `
                            <td class="py-3 md:py-4">
                                <span class="text-blue-400 font-medium text-sm md:text-base">${highlightedName}</span>
                            </td>
                            <td class="py-3 md:py-4 text-gray-300 max-w-xs truncate hidden md:table-cell">${highlightedAbout}</td>
                            <td class="py-3 md:py-4 text-yellow-400 text-xs md:text-sm">${dateString}</td>
                            <td class="py-3 md:py-4 hidden sm:table-cell">
                                ${item.image ? 
                                    `<span class="text-green-400 text-xs">✓</span>` : 
                                    `<span class="text-gray-500 text-xs">✗</span>`
                                }
                            </td>
                            <td class="py-3 md:py-4">
                                <div class="flex space-x-2">
                                    <button onclick="editItem(${item.id})" class="px-2 md:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                                        Edit
                                    </button>
                                    <button onclick="deleteItem(${item.id})" class="px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        `;
                        
                        allItemsTable.appendChild(row);
                    });
                }
            }
        }

        // Add Console Log
        function addConsoleLog(message, color = 'green') {
            const logElement = document.createElement('div');
            logElement.className = `mb-2 text-${color}-400`;
            logElement.textContent = `> ${message}`;
            
            consoleOutput.appendChild(logElement);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }

        // Add Security Log Entry
        function addSecurityLogEntry(message) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const logElement = document.createElement('div');
            logElement.className = 'text-green-400 text-sm';
            logElement.innerHTML = `
                <div class="flex">
                    <span class="text-gray-500 mr-2">[${timeString}]</span>
                    <span>${message}</span>
                </div>
            `;
            
            securityLogs.prepend(logElement);
            
            if (securityLogs.children.length > 10) {
                securityLogs.removeChild(securityLogs.lastChild);
            }
        }

        // Add Random Security Log
        function addSecurityLog() {
            if (!appState.systemActive) return;
            
            const logs = [
                'Firewall rules verified',
                'User activity monitored - No anomalies',
                'Database integrity check passed',
                'Network traffic analysis completed',
                'Security protocols updated',
                'Backup system verified',
                'Access logs reviewed',
                'Encryption algorithms validated'
            ];
            
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            addSecurityLogEntry(randomLog);
        }

        // Helper Functions
        function getTimeAgo(date) {
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) {
                return 'Just now';
            } else if (diffMins < 60) {
                return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        }

        // Add some sample items on first load
        if (!localStorage.getItem('greencore_sample_items_added')) {
            const sampleItems = [
                {
                    id: Date.now() - 86400000,
                    name: "Database Server",
                    about: "Main database server for storing user data and transactions",
                    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: Date.now() - 43200000,
                    name: "API Gateway",
                    about: "Handles all incoming API requests and routes them to appropriate services",
                    image: "",
                    date: new Date(Date.now() - 43200000).toISOString()
                },
                {
                    id: Date.now() - 21600000,
                    name: "Authentication Service",
                    about: "Manages user authentication and authorization across the platform",
                    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    date: new Date(Date.now() - 21600000).toISOString()
                }
            ];
            
            appState.items = [...sampleItems, ...appState.items];
            saveItems();
            localStorage.setItem('greencore_sample_items_added', 'true');
            
            updateSecurityLevel();
        }

        // Initialize the application
        initApp();