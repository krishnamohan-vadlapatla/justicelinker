import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';

const PAGES = {
    'privacy-policy': {
        icon: Shield,
        title: 'Privacy Policy',
        lastUpdated: 'March 1, 2026',
        content: [
            { heading: '1. Information We Collect', text: 'We collect information you provide when filing complaints, including your name, email address, phone number, and location details (state, district, mandal, village). We also collect complaint descriptions, uploaded evidence images, and any other information you voluntarily provide.' },
            { heading: '2. How We Use Your Information', text: 'Your information is used solely for the purpose of processing and resolving complaints. We use your contact details to send complaint status updates and OTP verification codes. Location data helps route complaints to appropriate authorities. We do not sell, trade, or rent your personal information to third parties.' },
            { heading: '3. Data Storage & Security', text: 'Your data is stored securely on encrypted servers. Images are stored via Cloudinary with secure URLs. We implement industry-standard security measures including HTTPS encryption, secure JWT authentication, and password hashing to protect your information.' },
            { heading: '4. Data Retention', text: 'Complaint data is retained for a minimum of 3 years for accountability and transparency purposes. You may request deletion of your account and associated personal data by contacting our support team. Anonymized complaint data may be retained indefinitely for statistical purposes.' },
            { heading: '5. Third-Party Services', text: 'We use third-party services including Cloudinary (image storage), Brevo (email delivery for OTP), and MySQL (database). These services have their own privacy policies and data handling practices.' },
            { heading: '6. Your Rights', text: 'You have the right to access, correct, or delete your personal data. You may request a copy of all data we hold about you. To exercise these rights, contact us at support@justicelinker.in.' },
            { heading: '7. Cookies', text: 'We use essential cookies and local storage for authentication (JWT tokens) and language preferences. We do not use tracking or advertising cookies.' },
            { heading: '8. Changes to This Policy', text: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the platform constitutes acceptance of the updated policy.' },
        ]
    },
    'terms': {
        icon: FileText,
        title: 'Terms & Conditions',
        lastUpdated: 'March 1, 2026',
        content: [
            { heading: '1. Acceptance of Terms', text: 'By accessing and using JusticeLinker, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use the platform.' },
            { heading: '2. Platform Purpose', text: 'JusticeLinker is a civic grievance reporting platform designed to help citizens of Andhra Pradesh report harassment, corruption, civic issues, and injustice. The platform facilitates complaint submission, tracking, and resolution.' },
            { heading: '3. User Responsibilities', text: 'Users must: (a) provide accurate and truthful information in all complaints; (b) not file false, misleading, or malicious complaints; (c) not use the platform for defamation, harassment, or illegal activities; (d) maintain the confidentiality of their account credentials.' },
            { heading: '4. Complaint Filing', text: 'Users are limited to 5 complaints per month to prevent abuse. All complaints are reviewed by moderators before action is taken. Filing false complaints may result in account suspension or termination. Priority levels are assigned by administrators, not users.' },
            { heading: '5. Account Suspension', text: 'We reserve the right to suspend or terminate accounts that: (a) file repeated false complaints; (b) engage in abusive behavior; (c) violate these Terms & Conditions; (d) attempt to manipulate or exploit the platform.' },
            { heading: '6. Intellectual Property', text: 'All content, design, and code of JusticeLinker is owned by the platform. Users retain ownership of their submitted content but grant us a non-exclusive license to use, display, and process their submissions for complaint resolution purposes.' },
            { heading: '7. Limitation of Liability', text: 'JusticeLinker is not liable for: (a) actions or inactions of any government authority; (b) the outcome or resolution of any complaint; (c) any loss arising from the use of, or inability to use, the platform; (d) the accuracy or completeness of information provided by other users.' },
            { heading: '8. Governing Law', text: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Andhra Pradesh, India.' },
        ]
    },
    'disclaimer': {
        icon: AlertTriangle,
        title: 'Disclaimer',
        lastUpdated: 'March 1, 2026',
        content: [
            { heading: 'Independent Platform', text: 'JusticeLinker is an independent civic reporting initiative and is NOT officially affiliated with any government authority, political party, or law enforcement agency unless explicitly stated. The platform operates independently to facilitate citizen grievance reporting.' },
            { heading: 'No Legal Advice', text: 'Nothing on this platform constitutes legal advice. If you require legal assistance, please consult a qualified legal professional. The platform merely facilitates the reporting and tracking of civic grievances.' },
            { heading: 'Complaint Verification', text: 'This platform does not automatically verify the truthfulness or accuracy of any complaint. All complaints are subjective reports from users and are subject to review by moderators. The presence of a complaint on this platform does not imply guilt or wrongdoing of any party mentioned.' },
            { heading: 'No Guarantee of Resolution', text: 'While we strive to facilitate complaint resolution, we cannot guarantee that any complaint will be resolved or that any specific action will be taken. Resolution depends on various factors including the nature of the complaint and the cooperation of relevant authorities.' },
            { heading: 'User-Generated Content', text: 'Complaints and evidence uploaded by users represent their personal accounts and opinions. JusticeLinker does not endorse or verify any user-generated content. We are not responsible for any defamatory, inaccurate, or misleading content submitted by users.' },
            { heading: 'Service Availability', text: 'We strive to maintain continuous platform availability but do not guarantee uninterrupted service. The platform may be temporarily unavailable due to maintenance, updates, or unforeseen technical issues.' },
        ]
    },
    'data-protection': {
        icon: Lock,
        title: 'Data Protection Policy',
        lastUpdated: 'March 1, 2026',
        content: [
            { heading: '1. Data Protection Principles', text: 'We adhere to the principles of the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (India). We ensure that personal data is: (a) collected lawfully and transparently; (b) used only for specified purposes; (c) kept accurate and up-to-date; (d) stored securely; (e) not kept longer than necessary.' },
            { heading: '2. Lawful Basis for Processing', text: 'We process personal data on the basis of: (a) consent — you provide data voluntarily when filing complaints; (b) legitimate interest — processing necessary to operate the platform and facilitate complaint resolution.' },
            { heading: '3. Data Minimization', text: 'We only collect data that is necessary for complaint processing. We do not collect unnecessary personal information. Anonymous complaint submission is available for users who prefer not to share personal details.' },
            { heading: '4. Data Security Measures', text: 'We implement: (a) SSL/TLS encryption for all data in transit; (b) encrypted database storage; (c) secure authentication via JWT tokens; (d) OTP-based email verification; (e) password hashing using BCrypt; (f) role-based access control; (g) regular security audits.' },
            { heading: '5. Data Breach Notification', text: 'In the event of a data breach that may affect your personal data, we will: (a) notify affected users within 72 hours; (b) report the breach to relevant authorities as required by law; (c) take immediate steps to mitigate the impact and prevent future breaches.' },
            { heading: '6. Data Subject Rights', text: 'Under applicable data protection laws, you have the right to: (a) access your personal data; (b) rectify inaccurate data; (c) erase your data (right to be forgotten); (d) restrict processing; (e) data portability; (f) object to processing. Contact support@justicelinker.in to exercise these rights.' },
            { heading: '7. International Data Transfers', text: 'Your data is primarily stored and processed within India. Some third-party services (Cloudinary, Brevo) may process data in their respective server locations. We ensure adequate safeguards are in place for any international data transfers.' },
            { heading: '8. Contact for Data Protection', text: 'For any data protection related queries or concerns, contact our Data Protection Officer at: dpo@justicelinker.in or support@justicelinker.in.' },
        ]
    }
};

export default function LegalPage() {
    const { page } = useParams();
    const { t } = useTranslation();
    const pageData = PAGES[page];

    if (!pageData) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
                    <Link to="/" className="text-brand-orange hover:underline">Go back home</Link>
                </div>
            </div>
        );
    }

    const Icon = pageData.icon;

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Header */}
            <header className="bg-dark-card border-b border-dark-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <img src="/JusticeLinker-favicon.png" alt="" className="w-6 h-6 rounded" />
                        <span className="font-bold text-sm">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                    {/* Title Section */}
                    <div className="bg-gradient-to-r from-brand-orange/10 to-transparent px-6 sm:px-8 py-6 border-b border-dark-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-brand-orange/10 rounded-lg">
                                <Icon size={20} className="text-brand-orange" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">{pageData.title}</h1>
                        </div>
                        <p className="text-xs text-gray-500">Last updated: {pageData.lastUpdated}</p>
                    </div>

                    {/* Body */}
                    <div className="px-6 sm:px-8 py-6 space-y-6">
                        {pageData.content.map((section, i) => (
                            <div key={i}>
                                <h2 className="text-sm font-semibold text-gray-200 mb-2">{section.heading}</h2>
                                <p className="text-sm text-gray-400 leading-relaxed">{section.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-8 py-4 bg-dark-hover border-t border-dark-border">
                        <p className="text-xs text-gray-500 text-center">
                            If you have questions about this {pageData.title.toLowerCase()}, contact us at{' '}
                            <a href="mailto:support@justicelinker.in" className="text-brand-orange hover:underline">support@justicelinker.in</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
