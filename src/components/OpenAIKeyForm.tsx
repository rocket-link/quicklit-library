
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, KeyRound } from "lucide-react";
import { getOpenAIKey, setOpenAIKey, clearOpenAIKey } from "@/lib/openai";
import { toast } from "@/hooks/use-toast";

const OpenAIKeyForm = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);
  const [isKeyVisible, setIsKeyVisible] = useState<boolean>(false);

  useEffect(() => {
    const storedKey = getOpenAIKey();
    setHasStoredKey(!!storedKey);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    setOpenAIKey(apiKey.trim());
    setHasStoredKey(true);
    setIsKeyVisible(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved successfully"
    });
  };

  const handleClearKey = () => {
    clearOpenAIKey();
    setApiKey('');
    setHasStoredKey(false);
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed"
    });
  };

  const toggleKeyVisibility = () => {
    setIsKeyVisible(!isKeyVisible);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Enter your OpenAI API key to enable AI-powered book summaries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security warning</AlertTitle>
          <AlertDescription>
            Your API key will be stored in your browser's local storage. 
            Never share your API keys and be aware that client-side storage is not fully secure.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="apiKey"
                type={isKeyVisible ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-grow"
              />
              <Button 
                variant="outline" 
                type="button"
                onClick={toggleKeyVisibility}
                className="flex-shrink-0"
              >
                {isKeyVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {hasStoredKey && (
          <Button variant="outline" type="button" onClick={handleClearKey}>
            Remove Key
          </Button>
        )}
        <Button type="button" onClick={handleSaveKey} className="ml-auto">
          Save API Key
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OpenAIKeyForm;
