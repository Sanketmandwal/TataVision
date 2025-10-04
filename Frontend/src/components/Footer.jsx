import React from 'react';
import { BarChart3, Twitter, Linkedin, Github, Mail, MapPin, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Analytics Dashboard", "API Access", "Pricing", "Documentation"]
    },
    {
      title: "Solutions",
      links: ["Sentiment Analysis", "Sales Growth", "Market Intelligence", "Customer Insights", "Competitor Analysis"]
    },
    {
      title: "Resources",
      links: ["Blog", "Case Studies", "White Papers", "Help Center", "API Documentation"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Contact", "Privacy Policy", "Terms of Service"]
    }
  ];

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Github, label: "GitHub", href: "#" }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TataVision
                </h3>
                <p className="text-xs text-slate-400 -mt-1">Social Analytics AI</p>
              </div>
            </div>
            
            <p className="text-slate-400 leading-relaxed">
              Empowering automotive brands with AI-driven social media analytics to transform customer sentiment into strategic sales growth.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-400 hover:text-blue-400 transition-colors">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">contact@tatavision.ai</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">+91 (22) 1234-5678</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 group hover:scale-110"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-blue-400 transition-colors text-sm inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {link}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-400">
            <p>&copy; 2025 TataVision. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-400">All systems operational</span>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs text-slate-400">
              Built for Tata Motors Hackathon 2025
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </footer>
  );
}