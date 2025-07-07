// Loom Brand Voice Components
// Confident, Clear, and Playful messaging

interface BrandMessageProps {
  type: 'empty' | 'success' | 'error' | 'welcome' | 'loading';
  title?: string;
  description?: string;
  context?: string;
}

export const BrandMessage = ({ type, title, description, context }: BrandMessageProps) => {
  const getMessage = () => {
    switch (type) {
      case 'empty':
        return {
          title: title || "A blank canvas!",
          description: description || "Let's bring your ideas to life. The magic starts here."
        };
      case 'success':
        return {
          title: title || "Voilà! We've got it sorted.",
          description: description || "We handled the boilerplate, so you can focus on the brilliant parts."
        };
      case 'error':
        return {
          title: title || "Hmm, that didn't work as expected.",
          description: description || "Let's double-check and get it sorted. No worries—we've got this."
        };
      case 'welcome':
        return {
          title: title || "Welcome to your creative partner!",
          description: description || "Ready to turn complexity into clarity? Let's build something amazing together."
        };
      case 'loading':
        return {
          title: title || "Weaving the magic...",
          description: description || "We're turning your data into delightful insights."
        };
      default:
        return { title: title || "", description: description || "" };
    }
  };

  const message = getMessage();

  return (
    <div className="text-center py-8 px-4">
      <h3 className="font-headline text-lg font-semibold text-foreground mb-2">
        {message.title}
      </h3>
      <p className="text-muted-foreground font-body">
        {message.description}
      </p>
      {context && (
        <p className="text-sm text-muted-foreground mt-2 italic">
          {context}
        </p>
      )}
    </div>
  );
};

// Preset messages for common scenarios
export const EmptyState = ({ title, description, context }: Partial<BrandMessageProps>) => (
  <BrandMessage type="empty" title={title} description={description} context={context} />
);

export const SuccessMessage = ({ title, description, context }: Partial<BrandMessageProps>) => (
  <BrandMessage type="success" title={title} description={description} context={context} />
);

export const ErrorMessage = ({ title, description, context }: Partial<BrandMessageProps>) => (
  <BrandMessage type="error" title={title} description={description} context={context} />
);

export const WelcomeMessage = ({ title, description, context }: Partial<BrandMessageProps>) => (
  <BrandMessage type="welcome" title={title} description={description} context={context} />
);

export const LoadingMessage = ({ title, description, context }: Partial<BrandMessageProps>) => (
  <BrandMessage type="loading" title={title} description={description} context={context} />
);