import { SavedNote, SystemLog } from "@/types/whiteboard";
import { Button } from "@/components/ui/button";
import { 
  FileImage, 
  Clock, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface NotesPanelProps {
  notes: SavedNote[];
  logs: SystemLog[];
  onDeleteNote: (id: string) => void;
  onDownloadNote: (note: SavedNote) => void;
}

const NotesPanel = ({ notes, logs, onDeleteNote, onDownloadNote }: NotesPanelProps) => {
  const getLogIcon = (type: SystemLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-danger" />;
      default:
        return <Info className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="control-panel space-y-4 max-h-[600px] overflow-hidden flex flex-col">
      {/* Saved Notes Section */}
      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Saved Notes (Story 7)
        </h3>
        
        {notes.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
            <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved snapshots yet</p>
            <p className="text-xs mt-1">Snapshots are auto-saved before erase</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg group"
              >
                <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                  <img 
                    src={note.imageData} 
                    alt={note.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{note.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(note.timestamp, "MMM d, HH:mm")}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => onDownloadNote(note)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Logs Section */}
      <div className="flex-1 min-h-0 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          System Logs (NFR2)
        </h3>
        
        <div className="space-y-1 overflow-y-auto max-h-64 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-2">No logs yet</p>
          ) : (
            logs.slice().reverse().map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-2 py-1 px-2 rounded hover:bg-secondary/50"
              >
                {getLogIcon(log.type)}
                <span className="text-muted-foreground flex-shrink-0">
                  [{format(log.timestamp, "HH:mm:ss")}]
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
