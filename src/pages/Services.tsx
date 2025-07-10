
import FeatureCard from '@/components/FeatureCard';
import { Code, Palette, Zap, Shield } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: 'Web Development',
      description: 'Custom web applications built with modern frameworks and best practices.',
      icon: Code,
    },
    {
      title: 'UI/UX Design',
      description: 'Beautiful, intuitive designs that provide exceptional user experiences.',
      icon: Palette,
    },
    {
      title: 'Performance Optimization',
      description: 'Fast, efficient applications optimized for speed and scalability.',
      icon: Zap,
    },
    {
      title: 'Security & Maintenance',
      description: 'Secure, reliable applications with ongoing support and updates.',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We offer comprehensive solutions to help your business succeed in the digital world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <FeatureCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
