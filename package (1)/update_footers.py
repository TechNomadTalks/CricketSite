#!/usr/bin/env python3
"""Update footer on all HTML pages with social media links and 24/7 hours"""

import re

footer_template = '''    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-4">
                    <h5 class="footer-title">Cricket Arena</h5>
                    <p class="footer-text">Port Shepstone's premier cricket net arena offering professional facilities and seamless online booking.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/dobusinessbetter" target="_blank" rel="noopener noreferrer" title="Facebook"><i class="bi bi-facebook"></i></a>
                        <a href="https://x.com/DoBusinessBest/status/1772639848089657487" target="_blank" rel="noopener noreferrer" title="X (Twitter)"><i class="bi bi-twitter-x"></i></a>
                        <a href="https://www.instagram.com/lockhat_inc" target="_blank" rel="noopener noreferrer" title="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="https://www.youtube.com/channel/UCtm7tInOPo9XdNdNcxn3Ufw" target="_blank" rel="noopener noreferrer" title="YouTube"><i class="bi bi-youtube"></i></a>
                    </div>
                </div>
                <div class="col-md-4">
                    <h5 class="footer-title">Quick Links</h5>
                    <ul class="footer-links">
                        <li><a href="facilities.html">Facilities</a></li>
                        <li><a href="pricing.html">Pricing</a></li>
                        <li><a href="booking.html">Book Now</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5 class="footer-title">Operating Hours</h5>
                    <ul class="footer-links">
                        <li><strong>Open 24/7</strong></li>
                        <li>Day & Night Bookings Available</li>
                        <li>Floodlights for Night Games</li>
                        <li>Book Anytime Online</li>
                    </ul>
                </div>
            </div>
            <hr class="footer-divider">
            <div class="footer-bottom">
                <p>&copy; 2025 Cricket Arena. All rights reserved. | Powered by South African Innovation</p>
            </div>
        </div>
    </footer>'''

html_files = [
    'index.html',
    'pricing.html',
    'booking.html',
    'about.html',
    'contact.html'
]

for filename in html_files:
    filepath = f'/workspace/cricket-arena-booking/frontend/{filename}'
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace footer section
        pattern = r'    <!-- Footer -->.*?</footer>'
        content = re.sub(pattern, footer_template, content, flags=re.DOTALL)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Updated {filename}')
    except Exception as e:
        print(f'Error updating {filename}: {e}')

print('All footers updated!')
