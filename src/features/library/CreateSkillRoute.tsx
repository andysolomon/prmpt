import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { createSkillLibraryItem, upsertItem } from '@/lib/library';

export function CreateSkillRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const skill = createSkillLibraryItem();
    upsertItem(skill);
    navigate(`/library/skills/${skill.id}`, { replace: true });
  }, [navigate]);

  return null;
}
