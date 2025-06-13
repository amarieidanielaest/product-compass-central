
import { useState } from 'react';
import { FileText, Wand2, Download, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PRDGenerator = () => {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedPRD, setGeneratedPRD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePRD = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a structured PRD template
    setTimeout(() => {
      const prd = `
# Product Requirements Document: ${featureTitle}

## Executive Summary
${featureDescription}

## Target Audience
${targetAudience}

## Problem Statement
This feature addresses the need for improved user experience and enhanced functionality within our product ecosystem.

## Success Metrics
- User adoption rate: Target 70% within 3 months
- Task completion time: Reduce by 25%
- User satisfaction: Maintain 4.5+ rating

## User Stories
- As a ${targetAudience}, I want to ${featureDescription.toLowerCase()} so that I can achieve my goals more efficiently
- As a product manager, I want to track feature usage to understand adoption patterns

## Technical Requirements
### Functional Requirements
1. Core functionality implementation
2. User interface design and development
3. Data validation and error handling
4. Performance optimization

### Non-Functional Requirements
1. Response time: < 2 seconds
2. Availability: 99.9% uptime
3. Security: HTTPS encryption, input validation
4. Scalability: Support 10x current user load

## Implementation Timeline
- Week 1-2: Design and prototyping
- Week 3-4: Core development
- Week 5: Testing and QA
- Week 6: Deployment and monitoring

## Risk Assessment
- Technical complexity: Medium
- Resource requirements: 2 developers, 1 designer
- Dependencies: None critical

## Acceptance Criteria
1. Feature meets all functional requirements
2. Passes all automated tests
3. User testing shows positive feedback
4. Performance benchmarks are met

---
Generated on: ${new Date().toLocaleDateString()}
      `.trim();
      
      setGeneratedPRD(prd);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPRD);
  };

  const downloadPRD = () => {
    const blob = new Blob([generatedPRD], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-${featureTitle.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">PRD Generator</h2>
        <p className="text-slate-600">Automatically generate Product Requirements Documents for your features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Feature Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feature-title">Feature Title</Label>
              <Input
                id="feature-title"
                placeholder="e.g., Advanced Search Functionality"
                value={featureTitle}
                onChange={(e) => setFeatureTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="feature-description">Feature Description</Label>
              <Textarea
                id="feature-description"
                placeholder="Describe what this feature does and its main purpose..."
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                placeholder="e.g., Power users, Admin users, End customers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={generatePRD}
              disabled={!featureTitle || !featureDescription || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PRD...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate PRD
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated PRD */}
        <Card>
          <CardHeader>
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
          <CardContent>
            {generatedPRD ? (
              <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700">
                  {generatedPRD}
                </pre>
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-lg text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Fill in the feature details and click "Generate PRD" to create your document</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PRDGenerator;
