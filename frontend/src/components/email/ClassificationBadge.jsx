import Badge from '../ui/Badge';

export default function ClassificationBadge({ classification, size = 'md' }) {
  if (!classification) return null;
  return <Badge variant={classification} size={size} />;
}
