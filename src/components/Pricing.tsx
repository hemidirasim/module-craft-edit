import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out the platform",
    features: [
      "100 embed credits",
      "Basic editor modules",
      "Community support",
      "Standard templates",
      "Basic analytics"
    ],
    popular: false,
    icon: Zap,
    gradient: "from-gray-400 to-gray-600",
    bgGradient: "from-gray-50 to-gray-100"
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    description: "For growing businesses and teams",
    features: [
      "5,000 embed credits",
      "All editor modules",
      "Priority support",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "Custom themes",
      "Team collaboration"
    ],
    popular: true,
    icon: Crown,
    gradient: "from-purple-400 to-blue-500",
    bgGradient: "from-purple-50 to-blue-50"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations",
    features: [
      "Unlimited embeds",
      "Custom modules",
      "Dedicated support",
      "SLA guarantee",
      "White-label solution",
      "Custom integrations",
      "On-premise deployment",
      "24/7 phone support"
    ],
    popular: false,
    icon: Rocket,
    gradient: "from-orange-400 to-red-500",
    bgGradient: "from-orange-50 to-red-50"
  }
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-gradient-subtle relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-hero-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-hero-secondary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Star size={16} className="animate-pulse" />
            Pricing Plans
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start free and scale as you grow. No hidden fees, no surprises, 
            <span className="text-primary font-semibold"> cancel anytime</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative p-8 group hover:shadow-elegant transition-smooth hover:-translate-y-2 ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-glow bg-card' 
                  : 'bg-card/80 backdrop-blur-sm border-0'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-card">
                    <Star size={16} className="fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}></div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-card`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-card-foreground">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-card-foreground">{plan.price}</span>
                    {plan.period !== "contact us" && (
                      <span className="text-muted-foreground text-lg">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-4 text-lg font-semibold transition-smooth transform hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow' 
                      : 'bg-card-foreground text-card shadow-card hover:shadow-elegant'
                  }`}
                  size="lg"
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <div className="bg-card rounded-2xl p-12 shadow-elegant border border-border/50">
            <h3 className="text-3xl font-bold mb-6 text-card-foreground">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-card-foreground mb-2">Can I cancel anytime?</h4>
                <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. No questions asked.</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground mb-2">What payment methods do you accept?</h4>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground mb-2">Is there a free trial?</h4>
                <p className="text-muted-foreground">Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground mb-2">Do you offer refunds?</h4>
                <p className="text-muted-foreground">We offer a 30-day money-back guarantee for all paid plans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};