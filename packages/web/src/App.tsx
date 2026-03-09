import { Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { PetsList } from '@/pages/PetsList';
import { PetCreate } from '@/pages/PetCreate';
import { PetDetail } from '@/pages/PetDetail';
import { PetEdit } from '@/pages/PetEdit';
import { MatchesList } from '@/pages/MatchesList';
import { MatchDetail } from '@/pages/MatchDetail';
import { MatchCreate } from '@/pages/MatchCreate';
import { BreedDetect } from '@/pages/BreedDetect';
import { Translate } from '@/pages/Translate';
import { VetAdvisor } from '@/pages/VetAdvisor';
import { Messages } from '@/pages/Messages';
import { ChatThread } from '@/pages/ChatThread';
import { Profile } from '@/pages/Profile';
import { Verification } from '@/pages/Verification';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/pets" element={<ProtectedRoute><PetsList /></ProtectedRoute>} />
        <Route path="/pets/new" element={<ProtectedRoute><PetCreate /></ProtectedRoute>} />
        <Route path="/pets/:id" element={<ProtectedRoute><PetDetail /></ProtectedRoute>} />
        <Route path="/pets/:id/edit" element={<ProtectedRoute><PetEdit /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><MatchesList /></ProtectedRoute>} />
        <Route path="/matches/new" element={<ProtectedRoute><MatchCreate /></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:matchId" element={<ProtectedRoute><ChatThread /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
        <Route path="/tools/breed-detect" element={<ProtectedRoute><BreedDetect /></ProtectedRoute>} />
        <Route path="/tools/translate" element={<ProtectedRoute><Translate /></ProtectedRoute>} />
        <Route path="/tools/vet-advisor" element={<ProtectedRoute><VetAdvisor /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
