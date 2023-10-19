import React from 'react';
import { getPosts } from './post-actions';
import PostItem from '@/molecules/user/posts/post-item';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfigs } from 'configs/auth';

export default async function Page() {
  const session = await getServerSession(authConfigs);

  if (!session) {
    redirect('/signIn');
  }

  const posts = await getPosts();

  return (
    <div>
      <div className='flex justify-between'>
        <div>
          <h1 className='text-4xl text-slate-700 font-extrabold'>POSTS</h1>
          <p className='mt-1'>Create, edit, and manage your posts.</p>
        </div>
      </div>
      <div className='mt-12'>
        {posts.length === 0 ? (
          <div>You haven’t any post yet.</div>
        ) : (
          posts.map((post) => <PostItem key={post.id} {...post} />)
        )}
      </div>
    </div>
  );
}