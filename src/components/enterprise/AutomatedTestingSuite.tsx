import React, { useState, useEffect } from 'react';
import { Play, Square, CheckCircle, XCircle, Clock, Code, Bug, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  progress: number;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  lastRun: string;
}

interface TestCase {
  id: string;
  suiteId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  error?: string;
  stackTrace?: string;
}

interface TestResult {
  id: string;
  timestamp: string;
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  coverage: number;
  duration: number;
  status: 'passed' | 'failed' | 'running';
}

const AutomatedTestingSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentRun, setCurrentRun] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);

      // Mock test suites data
      const suites: TestSuite[] = [
        {
          id: '1',
          name: 'Component Unit Tests',
          type: 'unit',
          status: 'passed',
          progress: 100,
          duration: 2.3,
          totalTests: 47,
          passedTests: 47,
          failedTests: 0,
          skippedTests: 0,
          lastRun: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          name: 'API Integration Tests',
          type: 'integration',
          status: 'failed',
          progress: 100,
          duration: 8.7,
          totalTests: 23,
          passedTests: 21,
          failedTests: 2,
          skippedTests: 0,
          lastRun: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          name: 'End-to-End User Flows',
          type: 'e2e',
          status: 'passed',
          progress: 100,
          duration: 45.2,
          totalTests: 12,
          passedTests: 12,
          failedTests: 0,
          skippedTests: 0,
          lastRun: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          name: 'Performance Tests',
          type: 'performance',
          status: 'passed',
          progress: 100,
          duration: 15.8,
          totalTests: 8,
          passedTests: 8,
          failedTests: 0,
          skippedTests: 0,
          lastRun: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          name: 'Security Vulnerability Scan',
          type: 'security',
          status: 'passed',
          progress: 100,
          duration: 32.1,
          totalTests: 156,
          passedTests: 156,
          failedTests: 0,
          skippedTests: 0,
          lastRun: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      setTestSuites(suites);

      // Mock test cases for failed suite
      const cases: TestCase[] = [
        {
          id: '1',
          suiteId: '2',
          name: 'POST /api/feedback - Create feedback item',
          status: 'passed',
          duration: 0.8
        },
        {
          id: '2',
          suiteId: '2',
          name: 'GET /api/feedback - Fetch feedback list',
          status: 'failed',
          duration: 1.2,
          error: 'Expected status 200 but got 500',
          stackTrace: 'Error: Database connection timeout\n    at request.get (/api/feedback:45)\n    at async test (/tests/integration/feedback.test.js:23)'
        },
        {
          id: '3',
          suiteId: '2',
          name: 'PUT /api/feedback/:id - Update feedback status',
          status: 'failed',
          duration: 0.9,
          error: 'Permission denied for user role',
          stackTrace: 'Error: Unauthorized access\n    at AuthMiddleware (/middleware/auth.js:12)\n    at PUT /api/feedback/:id'
        }
      ];
      setTestCases(cases);

      // Mock test results history
      const results: TestResult[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          totalSuites: 5,
          passedSuites: 4,
          failedSuites: 1,
          coverage: 87.5,
          duration: 104.1,
          status: 'failed'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          totalSuites: 5,
          passedSuites: 5,
          failedSuites: 0,
          coverage: 89.2,
          duration: 98.7,
          status: 'passed'
        }
      ];
      setTestResults(results);

    } catch (error) {
      console.error('Failed to load test data:', error);
      toast({
        title: "Error loading test data",
        description: "Failed to fetch testing information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    const startTime = Date.now();
    setCurrentRun({
      id: 'current',
      timestamp: new Date().toISOString(),
      totalSuites: testSuites.length,
      passedSuites: 0,
      failedSuites: 0,
      coverage: 0,
      duration: 0,
      status: 'running'
    });

    toast({
      title: "Test run started",
      description: "Running all test suites...",
    });

    // Simulate running tests
    for (let i = 0; i < testSuites.length; i++) {
      setTestSuites(prev => prev.map(suite => 
        suite.id === (i + 1).toString() 
          ? { ...suite, status: 'running', progress: 0 }
          : suite
      ));

      // Simulate test progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setTestSuites(prev => prev.map(suite => 
          suite.id === (i + 1).toString() 
            ? { ...suite, progress }
            : suite
        ));
      }

      // Mark as completed
      const status = Math.random() > 0.8 ? 'failed' : 'passed';
      setTestSuites(prev => prev.map(suite => 
        suite.id === (i + 1).toString() 
          ? { ...suite, status, progress: 100, lastRun: new Date().toISOString() }
          : suite
      ));
    }

    const duration = (Date.now() - startTime) / 1000;
    const finalResult: TestResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      totalSuites: testSuites.length,
      passedSuites: testSuites.filter(s => s.status === 'passed').length,
      failedSuites: testSuites.filter(s => s.status === 'failed').length,
      coverage: 87.5,
      duration,
      status: testSuites.some(s => s.status === 'failed') ? 'failed' : 'passed'
    };

    setCurrentRun(null);
    setTestResults(prev => [finalResult, ...prev]);

    toast({
      title: "Test run completed",
      description: `${finalResult.passedSuites}/${finalResult.totalSuites} suites passed`,
      variant: finalResult.status === 'passed' ? 'default' : 'destructive'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'skipped':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'integration':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'e2e':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-orange-600" />;
      case 'security':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <Bug className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'skipped':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const failedTests = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Automated Testing Suite
          </h2>
          <p className="text-muted-foreground">Comprehensive test automation and quality assurance</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={loadTestData}
            disabled={currentRun?.status === 'running'}
          >
            <Code className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={runAllTests}
            disabled={currentRun?.status === 'running'}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Test Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Code Coverage</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Avg Duration</p>
                <p className="text-2xl font-bold">1.8m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Run Status */}
      {currentRun && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
              Running Tests...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round((currentRun.passedSuites + currentRun.failedSuites) / currentRun.totalSuites * 100)}%</span>
              </div>
              <Progress value={(currentRun.passedSuites + currentRun.failedSuites) / currentRun.totalSuites * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="failures">Failed Tests</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(suite.type)}
                      <div>
                        <h3 className="font-medium">{suite.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {suite.totalTests} tests • Last run: {new Date(suite.lastRun).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(suite.status)}>
                      {getStatusIcon(suite.status)}
                      <span className="ml-1">{suite.status}</span>
                    </Badge>
                  </div>

                  {suite.status === 'running' && (
                    <div className="mb-3">
                      <Progress value={suite.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Passed:</span>
                      <div className="font-medium text-green-600">{suite.passedTests}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <div className="font-medium text-red-600">{suite.failedTests}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Skipped:</span>
                      <div className="font-medium text-gray-600">{suite.skippedTests}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{suite.duration}s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          {testCases.filter(tc => tc.status === 'failed').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Failed Tests</h3>
                <p className="text-muted-foreground">All tests are passing successfully</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testCases.filter(tc => tc.status === 'failed').map((testCase) => (
                <Alert key={testCase.id}>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{testCase.name}</h4>
                        <Badge variant="destructive">Failed</Badge>
                      </div>
                      {testCase.error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {testCase.error}
                        </p>
                      )}
                      {testCase.stackTrace && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Stack Trace</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {testCase.stackTrace}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {testResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">
                        Test Run - {new Date(result.timestamp).toLocaleString()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Duration: {result.duration}s • Coverage: {result.coverage}%
                      </p>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{result.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Suites:</span>
                      <div className="font-medium">{result.totalSuites}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passed:</span>
                      <div className="font-medium text-green-600">{result.passedSuites}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <div className="font-medium text-red-600">{result.failedSuites}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedTestingSuite;