document.addEventListener('DOMContentLoaded', () => {
    // Determine the base URL dynamically based on where it's hosted
    const BASE_URL = window.location.origin;
    
    // Update the domain display prefix in the UI
    const domainDisplay = document.getElementById('domain-display');
    domainDisplay.textContent = BASE_URL.replace(/^https?:\/\//, '') + '/';

    // Tabs logic
    const tabShorten = document.getElementById('tab-shorten');
    const tabAnalytics = document.getElementById('tab-analytics');
    const sectionShorten = document.getElementById('section-shorten');
    const sectionAnalytics = document.getElementById('section-analytics');

    function switchTab(showShorten) {
        if (showShorten) {
            tabShorten.classList.add('active');
            tabAnalytics.classList.remove('active');
            sectionShorten.style.display = 'block';
            sectionAnalytics.style.display = 'none';
            setTimeout(() => {
                sectionShorten.style.opacity = 1;
                sectionShorten.style.transform = 'translateY(0)';
            }, 10);
            sectionAnalytics.style.opacity = 0;
            sectionAnalytics.style.transform = 'translateY(20px)';
        } else {
            tabAnalytics.classList.add('active');
            tabShorten.classList.remove('active');
            sectionAnalytics.style.display = 'block';
            sectionShorten.style.display = 'none';
            setTimeout(() => {
                sectionAnalytics.style.opacity = 1;
                sectionAnalytics.style.transform = 'translateY(0)';
            }, 10);
            sectionShorten.style.opacity = 0;
            sectionShorten.style.transform = 'translateY(20px)';
        }
    }

    tabShorten.addEventListener('click', (e) => { e.preventDefault(); switchTab(true); });
    tabAnalytics.addEventListener('click', (e) => { e.preventDefault(); switchTab(false); });

    // Shorten Form Logic
    const shortenForm = document.getElementById('shorten-form');
    const shortenBtn = document.getElementById('shorten-btn');
    const shortenBtnText = shortenBtn.querySelector('span');
    const shortenLoader = document.getElementById('shorten-loader');
    const errorMsg = document.getElementById('error-message');
    const resultCard = document.getElementById('result-card');
    const shortLinkDisplay = document.getElementById('short-link-display');
    const copyBtn = document.getElementById('copy-btn');

    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = document.getElementById('url').value;
        const customCode = document.getElementById('customCode').value.trim();

        // UI Loading state
        shortenBtnText.classList.add('hidden');
        shortenLoader.classList.remove('hidden');
        shortenBtn.disabled = true;
        errorMsg.classList.add('hidden');
        resultCard.classList.add('hidden');

        try {
            const body = { url };
            if (customCode) body.customCode = customCode;

            const response = await fetch(`${BASE_URL}/api/v1/shorten`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                let errText = data.error || 'Something went wrong';
                if (data.details) {
                    errText = data.details.map(d => d.message).join(', ');
                }
                throw new Error(errText);
            }

            // Success
            // Use the dynamic origin for the resulting link instead of data.data.shortUrl
            // in case the server BASE_URL env variable isn't matching the live domain exactly.
            const finalShortUrl = `${BASE_URL}/${data.data.shortCode}`;
            
            shortLinkDisplay.textContent = finalShortUrl.replace(/^https?:\/\//, '');
            shortLinkDisplay.href = finalShortUrl;
            resultCard.classList.remove('hidden');
            
            // Clear input
            document.getElementById('url').value = '';
            document.getElementById('customCode').value = '';

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
        } finally {
            shortenBtnText.classList.remove('hidden');
            shortenLoader.classList.add('hidden');
            shortenBtn.disabled = false;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shortLinkDisplay.href);
        const icon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="#10b981" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = icon;
        }, 2000);
    });

    // Analytics Form Logic
    const analyticsForm = document.getElementById('analytics-form');
    const analyticsBtn = document.getElementById('analytics-btn');
    const analyticsBtnText = analyticsBtn.querySelector('span');
    const analyticsLoader = document.getElementById('analytics-loader');
    const analyticsError = document.getElementById('analytics-error');
    const analyticsDashboard = document.getElementById('analytics-dashboard');
    const recentClicksBody = document.getElementById('recent-clicks-body');

    analyticsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let code = document.getElementById('analyticsCode').value.trim();
        // If user pastes full URL, extract the code
        if (code.includes('/')) {
            code = code.split('/').pop();
        }

        analyticsBtnText.classList.add('hidden');
        analyticsLoader.classList.remove('hidden');
        analyticsBtn.disabled = true;
        analyticsError.classList.add('hidden');
        analyticsDashboard.classList.add('hidden');

        try {
            const response = await fetch(`${BASE_URL}/api/v1/analytics/${code}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analytics not found');
            }

            const stats = data.data;
            
            // Populate Dashboard
            document.getElementById('total-clicks').textContent = stats.totalClicks;
            
            const createDate = new Date(stats.createdAt);
            document.getElementById('created-date').textContent = createDate.toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });

            // Populate Table
            recentClicksBody.innerHTML = '';
            if (stats.recentClicks && stats.recentClicks.length > 0) {
                stats.recentClicks.forEach(click => {
                    const date = new Date(click.clickedAt);
                    const row = document.createElement('tr');
                    
                    const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    const ipStr = click.ipAddress || 'Unknown';
                    
                    // Simple User Agent parsing to avoid huge strings
                    let uaStr = click.userAgent || 'Unknown';
                    if (uaStr.length > 30) {
                        if (uaStr.includes('Mobile')) uaStr = 'Mobile Device';
                        else if (uaStr.includes('Windows')) uaStr = 'Windows Desktop';
                        else if (uaStr.includes('Macintosh')) uaStr = 'Mac Desktop';
                        else uaStr = uaStr.substring(0, 30) + '...';
                    }

                    row.innerHTML = `
                        <td>${timeStr}</td>
                        <td>${ipStr}</td>
                        <td>${uaStr}</td>
                    `;
                    recentClicksBody.appendChild(row);
                });
            } else {
                recentClicksBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted)">No clicks yet</td></tr>';
            }

            analyticsDashboard.classList.remove('hidden');

        } catch (error) {
            analyticsError.textContent = error.message;
            analyticsError.classList.remove('hidden');
        } finally {
            analyticsBtnText.classList.remove('hidden');
            analyticsLoader.classList.add('hidden');
            analyticsBtn.disabled = false;
        }
    });
});
