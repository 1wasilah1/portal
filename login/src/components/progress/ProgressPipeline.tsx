import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProgressStep = {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'rejected';
  date?: string;
};

interface ProgressPipelineProps {
  steps: ProgressStep[];
  className?: string;
}

const getStepIcon = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-6 h-6 text-accent" />;
    case 'active':
      return <Clock className="w-6 h-6 text-primary animate-pulse-glow" />;
    case 'pending':
      return <Clock className="w-6 h-6 text-muted-foreground" />;
    case 'rejected':
      return <XCircle className="w-6 h-6 text-destructive" />;
    default:
      return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
  }
};

const getStepColor = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-accent border-accent';
    case 'active':
      return 'bg-primary border-primary shadow-glow';
    case 'pending':
      return 'bg-muted border-muted-foreground';
    case 'rejected':
      return 'bg-destructive border-destructive';
    default:
      return 'bg-muted border-muted-foreground';
  }
};

const getLineColor = (currentStatus: ProgressStep['status'], nextStatus?: ProgressStep['status']) => {
  if (currentStatus === 'completed') {
    return 'bg-accent';
  }
  if (currentStatus === 'active' && nextStatus) {
    return 'bg-gradient-to-r from-primary to-muted';
  }
  return 'bg-muted';
};

export const ProgressPipeline = ({ steps, className }: ProgressPipelineProps) => {
  return (
    <div className={cn("py-8", className)}>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 transform -translate-x-1/2">
                <div 
                  className={cn(
                    "w-full h-full transition-all duration-500",
                    getLineColor(step.status, steps[index + 1]?.status)
                  )}
                />
              </div>
            )}
            
            {/* Step Container */}
            <div className="flex items-start space-x-4 pb-8">
              {/* Step Icon */}
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 transform",
                getStepColor(step.status),
                step.status === 'active' && "scale-110"
              )}>
                {getStepIcon(step.status)}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "bg-card rounded-lg p-6 shadow-card border transition-all duration-300 hover:shadow-elegant",
                  step.status === 'active' && "border-primary",
                  step.status === 'completed' && "border-accent",
                  step.status === 'rejected' && "border-destructive"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={cn(
                      "text-lg font-semibold transition-colors",
                      step.status === 'active' && "text-primary",
                      step.status === 'completed' && "text-accent",
                      step.status === 'rejected' && "text-destructive"
                    )}>
                      {step.title}
                    </h3>
                    {step.date && (
                      <span className="text-sm text-muted-foreground">
                        {step.date}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {/* Status Badge */}
                  <div className="mt-3">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      step.status === 'completed' && "bg-accent/10 text-accent",
                      step.status === 'active' && "bg-primary/10 text-primary",
                      step.status === 'pending' && "bg-muted text-muted-foreground",
                      step.status === 'rejected' && "bg-destructive/10 text-destructive"
                    )}>
                      {step.status === 'completed' && "Selesai"}
                      {step.status === 'active' && "Sedang Diproses"}
                      {step.status === 'pending' && "Menunggu"}
                      {step.status === 'rejected' && "Ditolak"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};