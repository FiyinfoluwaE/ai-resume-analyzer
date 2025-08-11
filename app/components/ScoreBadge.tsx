interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const getBadgeStyles = (score: number) => {
    if (score > 70) {
      return {
        background: "bg-green-100",
        text: "text-green-600",
        label: "Strong",
      };
    } else if (score > 49) {
      return {
        background: "bg-yellow-100",
        text: "text-yellow-600",
        label: "Good Start",
      };
    } else {
      return {
        background: "bg-red-100",
        text: "text-red-600",
        label: "Needs Work",
      };
    }
  };

  const { background, text, label } = getBadgeStyles(score);

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${background} ${text}`}
    >
      <p>{label}</p>
    </div>
  );
};

export default ScoreBadge;
