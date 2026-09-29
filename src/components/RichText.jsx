import { FORMAT_PATTERN } from '../utils/richText';

// Renderiza **negrita**, *cursiva* y ***ambas*** como elementos React (sin HTML crudo, por seguridad)
const RichText = ({ text = '', className = '' }) => {
  const parts = text.split(FORMAT_PATTERN);

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, i) => {
        if (part.length > 6 && part.startsWith('***') && part.endsWith('***')) {
          return <strong key={i}><em>{part.slice(3, -3)}</em></strong>;
        }
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </p>
  );
};

export default RichText;
