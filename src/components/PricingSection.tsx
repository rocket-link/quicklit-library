
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto md:px-6">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="mb-4 gradient-text">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">
            Choose the plan that works best for you. All plans include full access to our library.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 md:gap-12">
          {/* Monthly Plan */}
          <div className="relative flex flex-col p-6 bg-white border rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Monthly</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">$14.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Billed monthly</p>
            </div>

            <ul className="mb-8 space-y-3 text-sm">
              {[
                "Access to all book summaries",
                "Audio versions included",
                "New titles every week",
                "Mobile app access",
                "Cancel anytime"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 mr-2 text-quicklit-purple" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth?signup=true" className="mt-auto">
              <Button className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Annual Plan */}
          <div className="relative flex flex-col p-6 bg-white border-2 border-quicklit-purple rounded-lg shadow-lg">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1 bg-quicklit-purple text-white text-sm font-semibold rounded-full">
              Most Popular
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold">Annual</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Billed annually ($119.88)</p>
              <p className="mt-1 text-sm font-medium text-quicklit-purple">Save 33%</p>
            </div>

            <ul className="mb-8 space-y-3 text-sm">
              {[
                "Access to all book summaries",
                "Audio versions included",
                "New titles every week",
                "Mobile app access",
                "Priority support",
                "Download for offline reading"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 mr-2 text-quicklit-purple" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth?signup=true" className="mt-auto">
              <Button className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple">
                Get Annual Plan
              </Button>
            </Link>
          </div>

          {/* Lifetime Plan */}
          <div className="relative flex flex-col p-6 bg-white border rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Lifetime</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">$299</span>
                <span className="text-gray-500">/lifetime</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">One-time payment</p>
            </div>

            <ul className="mb-8 space-y-3 text-sm">
              {[
                "Unlimited lifetime access",
                "All current and future book summaries",
                "Audio versions included",
                "Mobile app access",
                "Priority support",
                "Download for offline reading",
                "Early access to new features"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 mr-2 text-quicklit-purple" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth?signup=true" className="mt-auto">
              <Button className="w-full bg-quicklit-purple hover:bg-quicklit-dark-purple">
                Get Lifetime Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
