import { useEffect, useMemo, useState } from 'react';
import { safeGetJson, safeSetJson } from '../utils/storage';

const STORAGE_KEY = 'socialStudyHub';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialState = {
  groups: [],
  challenges: [
    {
      id: 'weekly-focus',
      title: '7-Day Focus Quest',
      description: 'Complete at least 5 study sessions this week.',
      target: 5,
      unit: 'sessions',
    },
    {
      id: 'mock-exam',
      title: 'Mock Exam Marathon',
      description: 'Finish one full-length practice exam before the weekend.',
      target: 1,
      unit: 'practice exams',
    },
  ],
};

const readStorage = () => safeGetJson(STORAGE_KEY, initialState, 'social:read');

export function useSocialStudy(userName) {
  const [socialState, setSocialState] = useState(readStorage);

  useEffect(() => {
    safeSetJson(STORAGE_KEY, socialState, 'social:save');
  }, [socialState]);

  const createGroup = ({ name, focusTopic, nextSessionAt }) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSocialState((prev) => ({
      ...prev,
      groups: [
        {
          id: uid(),
          name: trimmed,
          focusTopic: focusTopic.trim() || 'General revision',
          nextSessionAt: nextSessionAt || '',
          members: [userName || 'Learner'],
          resources: [],
          sessions: [],
        },
        ...prev.groups,
      ],
    }));
  };

  const joinGroup = (groupId, memberName) => {
    const name = (memberName || userName || 'Learner').trim();
    setSocialState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId && !group.members.includes(name)
          ? { ...group, members: [...group.members, name] }
          : group
      ),
    }));
  };

  const addGroupSession = (groupId, payload) => {
    setSocialState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              sessions: [
                {
                  id: uid(),
                  title: payload.title,
                  when: payload.when,
                  members: payload.members?.length ? payload.members : group.members,
                },
                ...group.sessions,
              ],
            }
          : group
      ),
    }));
  };

  const shareResource = (groupId, resource) => {
    setSocialState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              resources: [
                {
                  id: uid(),
                  type: resource.type,
                  title: resource.title,
                  topicName: resource.topicName,
                  author: resource.author || userName || 'Learner',
                  createdAt: new Date().toISOString(),
                  content: resource.content,
                  reviews: [],
                },
                ...group.resources,
              ],
            }
          : group
      ),
    }));
  };

  const addPeerReview = (groupId, resourceId, review) => {
    setSocialState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              resources: group.resources.map((resource) =>
                resource.id === resourceId
                  ? {
                      ...resource,
                      reviews: [
                        ...resource.reviews,
                        {
                          id: uid(),
                          author: review.author || userName || 'Learner',
                          rating: review.rating,
                          comment: review.comment,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }
                  : resource
              ),
            }
          : group
      ),
    }));
  };

  const groupsForUser = useMemo(
    () => socialState.groups.filter((group) => group.members.includes(userName || 'Learner')),
    [socialState.groups, userName]
  );

  return {
    socialState,
    groupsForUser,
    createGroup,
    joinGroup,
    addGroupSession,
    shareResource,
    addPeerReview,
  };
}
