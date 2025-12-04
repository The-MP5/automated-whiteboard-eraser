import Header from "@/components/whiteboard/Header";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";
import ControlPanel from "@/components/whiteboard/ControlPanel";
import StatusDisplay from "@/components/whiteboard/StatusDisplay";
import NotesPanel from "@/components/whiteboard/NotesPanel";
import CountdownOverlay from "@/components/whiteboard/CountdownOverlay";
import { useWhiteboardSimulation } from "@/hooks/useWhiteboardSimulation";

const Index = () => {
  const {
    status,
    eraseMode,
    partialArea,
    notes,
    logs,
    progress,
    proximitySensor,
    isObstacleSimulated,
    countdownSeconds,
    setCanvas,
    setEraseMode,
    setPartialArea,
    saveSnapshot,
    deleteNote,
    downloadNote,
    startErase,
    pauseErase,
    stopErase,
    simulateObstacle,
    onCountdownComplete,
    onCountdownCancel,
  } = useWhiteboardSimulation();

  const isErasing = status === 'erasing' || status === 'paused' || status === 'obstacle-detected';

  return (
    <div className="min-h-screen bg-background">
      <Header isConnected={false} />

      {/* Countdown Overlay */}
      <CountdownOverlay
        seconds={countdownSeconds}
        isActive={status === 'countdown'}
        onComplete={onCountdownComplete}
        onCancel={onCountdownCancel}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <ControlPanel
              status={status}
              eraseMode={eraseMode}
              onStart={startErase}
              onPause={pauseErase}
              onStop={stopErase}
              onSetMode={setEraseMode}
              onSimulateObstacle={simulateObstacle}
              isObstacleSimulated={isObstacleSimulated}
            />
            <StatusDisplay
              status={status}
              progress={progress}
              proximitySensor={proximitySensor}
            />
          </aside>

          {/* Main Canvas Area */}
          <section className="lg:col-span-6 order-1 lg:order-2">
            <div className="control-panel">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Whiteboard Canvas</h2>
                <span className="text-xs text-muted-foreground font-mono">
                  FR1 / FR2: Digital Interface
                </span>
              </div>
              <WhiteboardCanvas
                eraseMode={eraseMode}
                isErasing={isErasing}
                eraseProgress={progress?.percentage || 0}
                partialArea={partialArea}
                onSetPartialArea={setPartialArea}
                onCanvasReady={setCanvas}
                onSaveSnapshot={saveSnapshot}
              />
            </div>

            {/* Requirements Info */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'FR4', label: 'Safety Sensors' },
                { id: 'FR5', label: 'Teacher Controls' },
                { id: 'NFR1', label: '10s Erase Time' },
                { id: 'NFR2', label: 'Error Logging' },
              ].map((req) => (
                <div 
                  key={req.id}
                  className="px-3 py-2 bg-card rounded-lg border border-border text-center"
                >
                  <span className="text-xs font-mono text-primary">{req.id}</span>
                  <p className="text-xs text-muted-foreground">{req.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right Sidebar - Notes & Logs */}
          <aside className="lg:col-span-3 order-3">
            <NotesPanel
              notes={notes}
              logs={logs}
              onDeleteNote={deleteNote}
              onDownloadNote={downloadNote}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Automated Whiteboard Eraser • Senior Capstone Project</p>
          <p className="text-xs mt-1">
            ROS Framework • Kinova Gen3 SDK • React Interface
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
