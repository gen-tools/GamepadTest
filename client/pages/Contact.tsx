import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const contactMethods = [
  {
    name: 'Email Support',
    description: 'Get help with technical issues and general inquiries',
    icon: Mail,
    value: 'sa0663787@gmail.com',
    action: 'mailto:sa0663787@gmail.com',
    response: 'Usually responds within 24 hours',
    color: 'bg-blue-500',
  },
  {
    name: 'Bug Reports',
    description: 'Report technical issues and bugs',
    icon: HelpCircle,
    value: 'Report an Issue',
    action: '#contact-form',
    response: 'We investigate all reports promptly',
    color: 'bg-red-500',
  },
  {
    name: 'Feature Requests',
    description: 'Suggest new features and improvements',
    icon: MessageSquare,
    value: 'Share Your Ideas',
    action: '#contact-form',
    response: 'Your feedback shapes our roadmap',
    color: 'bg-green-500',
  },
  {
    name: 'Business Inquiries',
    description: 'Partnership and collaboration opportunities',
    icon: Users,
    value: 'Business Contact',
    action: 'mailto:sa0663787@gmail.com',
    response: 'Professional inquiries welcome',
    color: 'bg-purple-500',
  },
];

const faqs = [
  {
    question: 'How do I report a bug or technical issue?',
    answer: 'Use our contact form below or email us directly at sa0663787@gmail.com with detailed information about the issue, including your browser type and operating system.',
  },
  {
    question: 'Can I suggest new features for GamepadTest?',
    answer: 'Absolutely! We love hearing from our community. Send us your feature ideas through the contact form or email, and we\'ll consider them for future updates.',
  },
  {
    question: 'Is GamepadTest completely free to use?',
    answer: 'Yes, GamepadTest is completely free to use. All our testing tools are available without any cost or registration requirements.',
  },
  {
    question: 'Do you offer business partnerships or integrations?',
    answer: 'We\'re open to discussing partnership opportunities and custom integrations. Please contact us at sa0663787@gmail.com with your business proposal.',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heroAnimation = useScrollAnimation();
  const methodsAnimation = useScrollAnimation();
  const formAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`[GamepadTest] ${formData.subject}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}

Message:
${formData.message}
    `);
    
    window.location.href = `mailto:sa0663787@gmail.com?subject=${subject}&body=${body}`;
    
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact GamepadTest',
    description: 'Get in touch with GamepadTest support team for technical assistance, feature requests, bug reports, and business inquiries.',
    url: 'https://www.gamepadtest.tech/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'GamepadTest',
      email: 'sa0663787@gmail.com',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'sa0663787@gmail.com',
          availableLanguage: 'English',
        },
        {
          '@type': 'ContactPoint',
          contactType: 'Technical Support',
          email: 'sa0663787@gmail.com',
          availableLanguage: 'English',
        },
      ],
    },
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Contact GamepadTest - Support, Feedback &amp; Business Inquiries</title>
        <meta name="description" content="Get in touch with GamepadTest support team for technical assistance, feature requests, bug reports, and business inquiries." />
        <meta name="keywords" content="contact gamepadchecker, gamepad support, controller help, technical support, bug reports, feature requests, business inquiries" />
        <link rel="canonical" href="https://www.gamepadtest.tech/contact" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden" ref={heroAnimation.ref}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiI+PC9jaXJjbGU+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            heroAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <Badge variant="outline" className="mb-6 animate-bounce-in">
              <Mail className="h-4 w-4 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient animate-scale-in">Contact</span> GamepadTest
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in animate-stagger-1">
              We're here to help! Whether you need technical support, want to report a bug, 
              suggest new features, or discuss business opportunities, we'd love to hear from you.
            </p>
            <div className={`mt-8 transition-all duration-700 delay-300 ${
              heroAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Clock className="h-4 w-4" />
                Usually responds within 24 hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 sm:py-32" ref={methodsAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            methodsAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Can We Help?</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose the best way to reach out based on your needs.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <Card 
                key={method.name}
                className={`group hover-lift transition-all duration-500 hover:border-primary/20 ${
                  methodsAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${method.color} group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {method.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <a
                    href={method.action}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {method.value}
                    <Send className="h-4 w-4" />
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {method.response}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 sm:py-32 bg-gray-50/50" ref={formAnimation.ref} id="contact-form">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Card className={`hover-lift transition-all duration-700 ${
              formAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Your Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="hover-glow focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="hover-glow focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover-glow focus:ring-2 focus:ring-primary"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="business">Business Inquiry</option>
                        <option value="support">Technical Support</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your inquiry"
                        className="hover-glow focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide as much detail as possible about your inquiry, issue, or suggestion..."
                      className="hover-glow focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full hover-scale"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    * Required fields. Your message will open in your default email client.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32" ref={faqAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            faqAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Quick answers to common questions about GamepadTest.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <dl className="space-y-8">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className={`transition-all duration-500 hover-scale hover:bg-muted/30 rounded-lg p-6 -m-6 ${
                    faqAnimation.isVisible ? 'animate-fade-in-left' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <dt className="text-lg font-semibold leading-7 flex items-start gap-3">
                    <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-125" />
                    {faq.question}
                  </dt>
                  <dd className="mt-3 ml-9 text-base leading-7 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Direct Contact Section */}
      <section className="py-16 bg-primary text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Need Immediate Assistance?</h2>
            <p className="mt-4 text-lg opacity-90">
              For urgent matters or direct communication, email us at:
            </p>
            <div className="mt-6">
              <a
                href="mailto:sa0663787@gmail.com"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-lg font-medium hover:bg-white/20 transition-colors hover-scale"
              >
                <Mail className="h-5 w-5" />
                sa0663787@gmail.com
              </a>
            </div>
            <p className="mt-4 text-sm opacity-75">
              We typically respond within 24 hours during business days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
