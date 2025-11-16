'use client';

import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  MessageSquare,
  Download,
  Sparkles
} from 'lucide-react';
import { useEffect } from 'react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  useEffect(() => {
    // Load HubSpot form script
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      if (window.hbspt) {
        // @ts-ignore
        window.hbspt.forms.create({
          portalId: "2371650",
          formId: "5cba9357-07c7-45a2-9ad9-651d1deadae2",
          region: "na1",
          target: '#hubspot-form-container'
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const features = [
    {
      icon: TrendingUp,
      title: 'Operational Intelligence',
      description: 'Ask "What was my net revenue last week?" or "Which activities had the highest capacity?" Get instant answers about revenue, costs, profitability, and operational performance across all activities and locations.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Business Insights',
      description: 'Natural language questions about your entire business. Ask about profit margins, guest satisfaction trends, capacity utilization, or staffing efficiency, just like talking to your business advisor.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Performance Analytics',
      description: 'Understand which activities drive the most revenue, track guest booking patterns, monitor capacity utilization, and identify opportunities to improve efficiency across operations.'
    },
    {
      icon: MessageSquare,
      title: 'Revenue & Experience Optimization',
      description: 'Identify your most profitable customers, peak booking times, and guest preferences. Discover opportunities to increase revenue, improve guest experience, and optimize operational efficiency.'
    },
    {
      icon: Clock,
      title: 'Capacity & Resource Planning',
      description: 'Track real-time capacity utilization across all activities and locations. Optimize staffing levels, identify peak times, and ensure you never miss revenue opportunities due to under or over-booking.'
    },
    {
      icon: CheckCircle,
      title: 'Guest Experience Tracking',
      description: 'Monitor guest satisfaction trends, track repeat bookings, and identify patterns in customer behavior. Use AI insights to enhance every touchpoint and build long-term loyalty.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/Resova Logo.svg"
                alt="Resova"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Features</a>
              <a href="https://get.resova.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Resova.com</a>
              <a
                href="https://registration.resova.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#2685CF] text-white rounded-lg hover:bg-[#1E6FB0] transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Free Trial
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img
                src="/RESOVAI Pwrd by CS.png"
                alt="Resova AI"
                className="h-32 md:h-40 mx-auto"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Operations, Decoded.
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              AI insights that Drive Revenue, Operational Efficiency, and Guest Experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center space-x-2 px-8 py-4 bg-[#2685CF] text-white rounded-lg hover:bg-[#1E6FB0] transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <span>Learn More</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://registration.resova.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all text-lg font-semibold"
              >
                <span>Start Free Trial</span>
              </a>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Powered by Claude AI  •  Direct Resova Integration  •  Secure & Private
            </p>
          </div>

          {/* Screenshot/Demo */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2685CF] to-cyan-500 blur-3xl opacity-30 rounded-3xl"></div>
            <div className="relative rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
              <img
                src="/dashboard-preview.png"
                alt="Resova Intelligence Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">1,500+</div>
              <div className="text-sm text-gray-400">Resova Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">Daily Bookings Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Business Intelligence for Venue Operators
            </h2>
            <p className="text-xl text-gray-600">
              Real-time insights for owner-managers who need to understand their business performance, from revenue and costs to guest experience and operational efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#2685CF]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#2685CF]/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#2685CF]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Business Intelligence in Minutes, Not Days
            </h2>
            <p className="text-lg text-gray-600">No spreadsheets. No waiting for reports. Just instant clarity on your operations, revenue, and guest experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2685CF] to-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Your System</h3>
              <p className="text-gray-600 leading-relaxed">
                Securely link your Resova account with API credentials. Your data syncs automatically, no manual imports required.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2685CF] to-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Business Performance</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor revenue, costs, capacity utilization, and guest satisfaction in real time. Understand which activities drive profit, where efficiency can improve, and how guests experience your venue.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2685CF] to-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Make Better Decisions</h3>
              <p className="text-gray-600 leading-relaxed">
                Get AI-powered recommendations to improve margins, optimize operations, enhance guest experience, and grow revenue across your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2685CF] to-blue-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Get Complete Business Clarity
              </h2>
              <p className="text-blue-100 text-lg">
                Fill out the form below and we'll be in touch to discuss how Resova Intelligence can help you understand and optimize your entire operation.
              </p>
            </div>

            <div className="p-8">
              <div id="hubspot-form-container"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2685CF]/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2685CF]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Business Operations?
            <span className="block text-[#2685CF] mt-2">Get Complete Clarity in Minutes, Not Days</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join venue operators who use Resova Intelligence to track profitability, optimize operations, enhance guest experience, and grow revenue with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="https://registration.resova.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-[#2685CF] text-white rounded-lg hover:bg-[#1E6FB0] transition-all shadow-xl hover:shadow-2xl text-lg font-semibold"
            >
              Start Free Trial
            </a>
            <button
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-white/10 text-white border-2 border-white/30 rounded-lg hover:bg-white/20 transition-all text-lg font-semibold backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            <span className="text-green-400">✓</span> Direct Resova Integration  •
            <span className="text-green-400 ml-2">✓</span> Setup in Minutes  •
            <span className="text-green-400 ml-2">✓</span> Dedicated Support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img
                  src="/RESOVA AI INTELLIGENCE.png"
                  alt="Resova"
                  className="h-7"
                />
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-md">
                Business intelligence and real-time performance analytics for venue operators and owner-managers using Resova. Track revenue, operations, and guest experience all in one place.
              </p>
              <div className="mt-6 flex items-center space-x-4">
                <span className="text-sm text-gray-500">Powered by</span>
                <span className="text-sm font-semibold text-gray-300">Claude AI</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-[#2685CF] transition-colors">Features</a></li>
                <li><a href="https://get.resova.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Resova Platform</a></li>
                <li><a href="#" className="hover:text-[#2685CF] transition-colors">API Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="https://get.resova.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">About Resova</a></li>
                <li><a href="https://get.resova.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Contact Sales</a></li>
                <li><a href="#" className="hover:text-[#2685CF] transition-colors">Support Center</a></li>
                <li><a href="#" className="hover:text-[#2685CF] transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500">
                © 2025 Resova Intelligence. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <a href="#" className="hover:text-[#2685CF] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#2685CF] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#2685CF] transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}