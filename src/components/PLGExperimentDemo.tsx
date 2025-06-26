
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, TrendingUp, Users } from 'lucide-react';
import { usePLGExperiments } from '@/services/PLGExperimentManager';

const PLGExperimentDemo = () => {
  const { experimentManager, loading } = usePLGExperiments();

  const onboardingVariant = experimentManager.getOnboardingVariant();
  const ctaVariant = experimentManager.getCTAVariant();
  const pricingVariant = experimentManager.getPricingVariant();
  const activationFlow = experimentManager.getActivationFlow();

  const handleCTAClick = async () => {
    await experimentManager.trackConversion('cta_button', 'click');
    console.log('CTA clicked - conversion tracked');
  };

  const handleSignup = async () => {
    await experimentManager.trackConversion('onboarding_flow', 'signup');
    console.log('Signup completed - conversion tracked');
  };

  if (loading) return <div>Loading experiments...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">PLG Experiment Demo</h1>
        <p className="text-lg text-gray-600">
          This page demonstrates active PLG experiments and A/B tests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding Flow Experiment */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-800">
              <Target className="w-5 h-5 mr-2" />
              Onboarding Flow
            </CardTitle>
            <Badge variant="outline">Variant: {onboardingVariant}</Badge>
          </CardHeader>
          <CardContent>
            {onboardingVariant === 'progressive' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800">Step 1: Welcome</h3>
                  <p className="text-sm text-emerald-700">Personalized welcome message</p>
                </div>
                <div className="bg-emerald-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800">Step 2: Setup</h3>
                  <p className="text-sm text-emerald-700">Guided setup process</p>
                </div>
              </div>
            )}
            {onboardingVariant === 'gamified' && (
              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">🎯 Mission: Get Started</h3>
                  <p className="text-sm text-purple-700">Complete your profile to earn points!</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">🏆 Achievement Unlocked</h3>
                  <p className="text-sm text-purple-700">Ready to explore features</p>
                </div>
              </div>
            )}
            <Button onClick={handleSignup} className="w-full mt-4">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>

        {/* CTA Button Experiment */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Zap className="w-5 h-5 mr-2" />
              Call-to-Action Test
            </CardTitle>
            <Badge variant="outline">Variant: {ctaVariant.text}</Badge>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleCTAClick}
              className={`
                ${ctaVariant.color === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
                ${ctaVariant.color === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                ${ctaVariant.size === 'lg' ? 'px-8 py-4 text-lg' : ''}
              `}
            >
              {ctaVariant.text}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Color: {ctaVariant.color} | Size: {ctaVariant.size}
            </p>
          </CardContent>
        </Card>

        {/* Pricing Display Experiment */}
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <TrendingUp className="w-5 h-5 mr-2" />
              Pricing Display
            </CardTitle>
            <Badge variant="outline">Variant: {pricingVariant}</Badge>
          </CardHeader>
          <CardContent>
            {pricingVariant === 'cards' && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <h4 className="font-semibold">Starter</h4>
                  <p className="text-lg">$9</p>
                </div>
                <div className="bg-blue-50 p-3 rounded text-center border-2 border-blue-300">
                  <h4 className="font-semibold">Pro</h4>
                  <p className="text-lg">$29</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <h4 className="font-semibold">Enterprise</h4>
                  <p className="text-lg">$99</p>
                </div>
              </div>
            )}
            {pricingVariant === 'table' && (
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>Starter</span>
                  <span>$9/month</span>
                </div>
                <div className="flex justify-between border-b pb-1 font-semibold">
                  <span>Pro</span>
                  <span>$29/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise</span>
                  <span>$99/month</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activation Flow Experiment */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Users className="w-5 h-5 mr-2" />
              Activation Strategy
            </CardTitle>
            <Badge variant="outline">Flow: {activationFlow}</Badge>
          </CardHeader>
          <CardContent>
            {activationFlow === 'guided' && (
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full text-center mr-2">1</div>
                  Setup your first project
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-purple-300 text-white rounded-full text-center mr-2">2</div>
                  Invite team members
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 bg-gray-300 text-white rounded-full text-center mr-2">3</div>
                  Create your first feature flag
                </div>
              </div>
            )}
            {activationFlow === 'self_serve' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Explore at your own pace
                </p>
                <Button variant="outline" size="sm">Browse Features</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Experiment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">4</p>
              <p className="text-sm text-gray-600">Active Experiments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Feature Flags</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">2.3%</p>
              <p className="text-sm text-gray-600">Conversion Lift</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">95%</p>
              <p className="text-sm text-gray-600">Statistical Significance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLGExperimentDemo;
