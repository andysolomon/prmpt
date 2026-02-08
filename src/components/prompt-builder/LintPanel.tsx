import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LintIssue } from '@/lib/prompt';

interface LintPanelProps {
  issues: LintIssue[];
}

export function LintPanel({ issues }: LintPanelProps) {
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const infos = issues.filter((issue) => issue.severity === 'info');

  const qualityState = errors.length === 0 ? 'Ready' : 'Needs work';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lint ({qualityState})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          Errors: {errors.length} | Warnings: {warnings.length} | Info: {infos.length}
        </p>
        {issues.length === 0 && <p className="text-muted-foreground">No issues found.</p>}
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`rounded border p-2 ${
              issue.severity === 'error'
                ? 'border-red-300 bg-red-50'
                : issue.severity === 'warning'
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-slate-200'
            }`}
          >
            <p className="font-medium">
              {issue.severity.toUpperCase()}: {issue.message}
            </p>
            {issue.fieldPath && <p className="text-xs text-muted-foreground">Field: {issue.fieldPath}</p>}
            {issue.suggestions && issue.suggestions.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {issue.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
