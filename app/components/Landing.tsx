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
    // Clear any stale authentication data on landing page
    if (typeof window !== 'undefined') {
      localStorage.clear();
      console.log('🧹 Cleared localStorage on landing page');
    }

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
                src="/RESOVA.svg"
                alt="Resova"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Features</a>
              <a href="https://get.resova.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Resova.com</a>
              <a href="https://get.resova.com/pricing/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Pricing</a>
              <a href="https://get.resova.com/support/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Support</a>
              <a href="https://login.resova.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#2685CF] font-medium transition-colors">Login</a>
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
                src="/RESOVAI Pwrd by CS.svg"
                alt="Resova AI"
                className="h-24 md:h-32 mx-auto"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Operations, Decoded.
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              AI insights that Drive Revenue, Streamline Operations and Enhance the Guest Experience.
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
            <div className="relative bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl border border-slate-700 p-6">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-[#2685CF] to-blue-600 rounded-t-lg px-6 py-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Resova Intelligence</h3>
                      <p className="text-blue-100 text-xs">Real-time Analytics Dashboard</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 text-xs text-blue-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Metric Cards */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">Today's Revenue</span>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-white text-2xl font-bold">$3,247</div>
                  <div className="text-green-400 text-xs mt-1">+12.5% vs yesterday</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">Bookings</span>
                    <BarChart3 className="w-4 h-4 text-[#2685CF]" />
                  </div>
                  <div className="text-white text-2xl font-bold">127</div>
                  <div className="text-[#2685CF] text-xs mt-1">18 this hour</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">Capacity</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-white text-2xl font-bold">84%</div>
                  <div className="text-amber-400 text-xs mt-1">Prime time slots</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">Avg. Value</span>
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-white text-2xl font-bold">$42</div>
                  <div className="text-purple-400 text-xs mt-1">Per booking</div>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold text-sm">Revenue Trend (7 Days)</h4>
                  <Sparkles className="w-4 h-4 text-[#2685CF]" />
                </div>
                <div className="h-32 flex items-end justify-between space-x-2">
                  {[45, 52, 48, 65, 72, 68, 85].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#2685CF] to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* AI Insight Banner */}
              <div className="mt-4 bg-gradient-to-r from-[#2685CF]/20 to-purple-500/20 border border-[#2685CF]/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#2685CF]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#2685CF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-1">AI Recommendation</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Your Saturday afternoon slots are selling 23% faster this week. Consider adding capacity or increasing prices for peak times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">1,500+</div>
              <div className="text-sm text-gray-400">Resova Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">Daily Bookings Analyzed</div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Features */}
            <div>
              <h4 className="font-bold mb-4 text-white">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/speedpay/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">SpeedPay</a></li>
                <li><a href="https://get.resova.com/features/feature/booking-payments-gifts/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Bookings, Payments & Gifts</a></li>
                <li><a href="https://get.resova.com/features/feature/advanced-scheduling-pricing/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Advanced Scheduling & Pricing</a></li>
                <li><a href="https://get.resova.com/features/feature/free-booking-website/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Free Booking Website</a></li>
                <li><a href="https://get.resova.com/features/feature/cloud-based-calendar/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Cloud Based Calendar</a></li>
                <li><a href="https://get.resova.com/features/feature/crm-waivers/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">CRM & Waivers</a></li>
                <li><a href="https://get.resova.com/features/feature/marketing-promotion-tools/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Marketing & Promotion Tools</a></li>
                <li><a href="https://get.resova.com/features/feature/team-scheduling-management/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Team Scheduling & Management</a></li>
                <li><a href="https://get.resova.com/features/feature/automated-emails-and-text-messages/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Emails & Text Messages</a></li>
                <li><a href="https://get.resova.com/features/feature/indepth-reporting-tracking/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">In-depth Reporting & Tracking</a></li>
                <li><a href="https://get.resova.com/features/feature/all-features/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors font-semibold">View all features</a></li>
              </ul>
            </div>

            {/* Industries & Integrations */}
            <div>
              <h4 className="font-bold mb-4 text-white">Industries</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/built-for/industries/escape-rooms/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Escape Rooms</a></li>
                <li><a href="https://get.resova.com/built-for/solutions/activities-and-tours/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Activities & Tours</a></li>
                <li><a href="https://get.resova.com/museum-ticketing-software/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Interactive Art Museums</a></li>
              </ul>

              <h4 className="font-bold mb-4 text-white mt-6">Integrations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/features/integrations/website-integrations/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Website Integrations</a></li>
                <li><a href="https://get.resova.com/features/integrations/payment-gateways-options/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Payment Gateways & Options</a></li>
                <li><a href="https://get.resova.com/features/integrations/calendar-sync-integrations/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Calendar Syncing</a></li>
                <li><a href="https://get.resova.com/features/integrations/all-integrations/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors font-semibold">View all integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/pricing/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Pricing & Plans</a></li>
                <li><a href="https://get.resova.com/about/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">About Us</a></li>
                <li><a href="https://get.resova.com/security/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Security & PCI</a></li>
                <li><a href="https://get.resova.com/press-resources/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Press Resources</a></li>
                <li><a href="https://get.resova.com/contact-us/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/support/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">24/7 Help & Support</a></li>
                <li><a href="https://get.resova.com/faq/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">FAQs</a></li>
                <li><a href="https://info.resova.com/resova-knowledge-center" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Help Center</a></li>
                <li><a href="https://developers.resova.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Developers Hub</a></li>
                <li><a href="https://status.resova.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">App Status</a></li>
                <li><a href="https://get.resova.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://get.resova.com/terms/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Terms of Service</a></li>
                <li><a href="https://get.resova.com/privacy/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2685CF] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
              <div>
                <p>© 2025. All rights reserved | Company No: 09559910.</p>
                <p>VAT No: GB 263 0458 16.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}