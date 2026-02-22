import { redirect } from 'next/navigation';


<p className="mt-4 text-gray-600">
 Built by Gulshan Kotiya — Full Stack Developer
</p>
export default function Home() {
  redirect('/companies');
}
