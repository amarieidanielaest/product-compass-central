
import { useState } from 'react';
import { FileText, Wand2, Download, Copy, Settings, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PRDGenerator = () => {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [businessGoals, setBusinessGoals] = useState('');
  const [technicalConstraints, setTechnicalConstraints] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const generatePRDWithAI = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your OpenAI API key first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Generate a comprehensive Product Requirements Document (PRD) for the following feature:

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}
Target Audience: ${targetAudience}
Business Goals: ${businessGoals}
Technical Constraints: ${technicalConstraints}

Please create a detailed PRD that includes:
1. Executive Summary
2. Problem Statement
3. Solution Overview
4. User Stories and Acceptance Criteria
5. Technical Requirements (Functional & Non-Functional)
6. Success Metrics and KPIs
7. Implementation Timeline
8. Risk Assessment
9. Dependencies
10. Testing Strategy

Format the response in markdown and make it comprehensive yet clear.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a senior product manager with expertise in writing comprehensive Product Requirements Documents. Create detailed, actionable PRDs that follow industry best practices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      setGeneratedPRD(generatedContent);
    } catch (error) {
      console.error('Error generating PRD:', error);
      alert('Failed to generate PRD. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPRD);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadPRD = () => {
    const blob = new Blob([generatedPRD], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-${featureTitle.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFormValid = featureTitle && featureDescription && targetAudience;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            AI-Powered PRD Generator
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Generate comprehensive Product Requirements Documents using advanced AI technology
          </p>
        </div>

        {/* API Key Configuration */}
        <Card className="mb-8 border-dashed border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" />
                API Configuration
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              >
                {showApiKeyInput ? 'Hide' : 'Configure'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showApiKeyInput && (
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
                    We recommend connecting to Supabase for secure API key management.
                  </p>
                </div>
                <div className="relative">
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Feature Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="feature-title" className="text-sm font-medium">Feature Title *</Label>
                  <Input
                    id="feature-title"
                    placeholder="e.g., Advanced Search with AI Filters"
                    value={featureTitle}
                    onChange={(e) => setFeatureTitle(e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feature-description" className="text-sm font-medium">Feature Description *</Label>
                  <Textarea
                    id="feature-description"
                    placeholder="Describe what this feature does, its main purpose, and key capabilities..."
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-audience" className="text-sm font-medium">Target Audience *</Label>
                  <Input
                    id="target-audience"
                    placeholder="e.g., Power users, Admin users, Enterprise customers"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-goals" className="text-sm font-medium">Business Goals</Label>
                  <Textarea
                    id="business-goals"
                    placeholder="What business objectives will this feature help achieve?"
                    value={businessGoals}
                    onChange={(e) => setBusinessGoals(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="technical-constraints" className="text-sm font-medium">Technical Constraints</Label>
                  <Textarea
                    id="technical-constraints"
                    placeholder="Any technical limitations, dependencies, or requirements..."
                    value={technicalConstraints}
                    onChange={(e) => setTechnicalConstraints(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={generatePRDWithAI}
                  disabled={!isFormValid || isGenerating || !apiKey}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating PRD with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate PRD with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated PRD */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span>Generated PRD</span>
                  {generatedPRD && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadPRD}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {generatedPRD ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                        {generatedPRD}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Generate</h3>
                    <p className="text-slate-500 mb-4">
                      Fill in the feature details and configure your API key to generate a comprehensive PRD
                    </p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>✓ Comprehensive analysis</p>
                      <p>✓ Industry best practices</p>
                      <p>✓ Actionable requirements</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRDGenerator;
