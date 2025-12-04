import { Bot, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
}

const Header = ({ isConnected }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Automated Whiteboard Eraser
              </h1>
              <p className="text-xs text-muted-foreground">
                Senior Capstone Project • ROS Simulation Interface
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            isConnected 
              ? 'bg-success/20 text-success' 
              : 'bg-danger/20 text-danger'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="font-medium">ROS Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">Simulated Mode</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
