import { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import * as signalR from '@microsoft/signalr';
import Modal from 'react-modal';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-terminal';

Modal.setAppElement('#root');

function App() {
  const [sql, setSql] = useState('SELECT * FROM users;');
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  // Estilos do modal
  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1f2937',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      width: '80%',
      fontSize: '14px',
      maxHeight: '90vh',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    }
  };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://blood-bugs-centered-recognized.trycloudflare.com/loghub')
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => console.log('Connected to SignalR'));

    connection.on('ReceiveLog', (log) => {
      try {
        const parsedLog = JSON.parse(log);
        console.log(parsedLog);
        setLogs(prev => [parsedLog, ...prev]);
      } catch (err) {
        console.error('Error parsing log:', err);
      }
    });

    return () => connection.stop();
  }, []);

  const executeSql = async () => {
    try {
      const res = await fetch('https://blood-bugs-centered-recognized.trycloudflare.com/exec-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      console.log('Execution result:', data);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const getOperationDetails = (op) => {
    switch (op) {
      case 'c': return { text: 'Criado', color: 'bg-green-600' };
      case 'u': return { text: 'Atualizado', color: 'bg-blue-600' };
      case 'd': return { text: 'Excluído', color: 'bg-red-600' };
      default: return { text: op, color: 'bg-gray-600' };
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Editor SQL */}
      <div className="w-1/2 p-4 border-r border-gray-700 flex flex-col">
        <button
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded self-start"
          onClick={executeSql}
        >
          Executar
        </button>
        
        <AceEditor
          mode="sql"
          theme="terminal"
          value={sql}
          onChange={setSql}
          name="sql-editor"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="100%"
          fontSize={14}
          showPrintMargin={false}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
        />
      </div>

      {/* Painel de Logs */}
      <div className="w-1/2 p-4 bg-gray-800 overflow-y-auto">
        <div className="space-y-2">
          {logs.map((log, index) => {
            const operation = getOperationDetails(log.payload?.op);
            const table = log.payload?.source?.table || 'unknown_table';
            const timestamp = log.payload?.source?.ts_ms 
              ? new Date(log.payload.source.ts_ms).toLocaleString() 
              : 'N/A';

            return (
              <div
                key={index}
                className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`${operation.color} px-2 py-1 rounded text-sm`}>
                      {operation.text}
                    </span>
                    <span className="font-medium">{table}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={!!selectedLog}
        onRequestClose={() => setSelectedLog(null)}
        style={modalStyles}
        contentLabel="Detalhes do Log"
      >
        {selectedLog && (
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalhes Completo</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-[70vh] 
                text-base font-mono antialiased leading-relaxed 
                whitespace-pre-wrap">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;