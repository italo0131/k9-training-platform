'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface DeletePostButtonProps {
  postId: string;
  authorId: string;
  postType: 'blog' | 'forum';
  onDelete?: () => void; // callback opcional
}

export default function DeletePostButton({
  postId,
  authorId,
  postType,
  onDelete,
}: DeletePostButtonProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!user || user.id !== authorId) {
    return null; // não mostra o botão para quem não é o autor
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    setIsDeleting(true);
    try {
      const endpoint = `/api/${postType}/posts/${postId}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');

      if (onDelete) onDelete();
      else router.refresh(); // recarrega os dados da página
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Falha ao excluir. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
