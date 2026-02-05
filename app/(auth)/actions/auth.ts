'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const supabase = await createServerClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validation des entrées
  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs' }
  }

  try {
    // Authentification avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Erreur d\'authentification:', authError)
      
      // Messages d'erreur conviviaux
      if (authError.message.includes('Invalid login credentials')) {
        return { error: 'Email ou mot de passe incorrect' }
      }
      if (authError.message.includes('Email not confirmed')) {
        return { error: 'Veuillez confirmer votre adresse email avant de vous connecter' }
      }
      
      return { error: 'Erreur de connexion: ' + authError.message }
    }

    if (!authData.user) {
      return { error: 'Erreur lors de l\'authentification' }
    }

    // Vérification du statut du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('isActive')
      .eq('userId', authData.user.id)
      .single()

    if (profileError || !profile) {
      // Si le profil n'existe pas, déconnecter l'utilisateur
      await supabase.auth.signOut()
      return { error: 'Profil non trouvé. Veuillez contacter l\'administrateur.' }
    }

    if (!profile.isActive) {
      await supabase.auth.signOut()
      return { error: 'Votre compte a été désactivé. Contactez l\'administrateur.' }
    }

    // Succès
    return { success: true }

  } catch (error) {
    console.error('Erreur de connexion:', error)
    return { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' }
  }
}

export async function signUp(formData: FormData) {
  const supabase = await createServerClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const branch = formData.get('branch') as string || 'Clinique principale'

  // Validation des entrées
  if (!email || !password || !confirmPassword || !fullName) {
    return { error: 'Veuillez remplir tous les champs obligatoires' }
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères' }
  }

  // Vérifier si l'email existe déjà
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { error: 'Cet email est déjà utilisé' }
  }

  try {
    // Inscrire l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'doctor'
        }
      }
    })

    if (authError) {
      console.error('Erreur d\'authentification:', authError)
      
      if (authError.message.includes('User already registered')) {
        return { error: 'Cet email est déjà enregistré' }
      }
      
      return { error: 'Erreur d\'authentification: ' + authError.message }
    }

    if (!authData.user) {
      return { error: 'Erreur lors de la création de l\'utilisateur' }
    }

    // Créer le profil dans la table public.profiles
    const profileData = {
      userId: authData.user.id,
      fullName,
      email,
      phoneNumber,
      role: 'doctor',
      branch,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      // Tenter de supprimer l'utilisateur auth si le profil échoue
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error('Erreur du profil:', profileError)
      return { error: 'Échec de la création du profil: ' + profileError.message }
    }

    return { 
      success: 'Inscription réussie ! Vous pouvez maintenant vous connecter avec vos identifiants.'
    }

  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    return { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' }
  }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createServerClient()
  
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Veuillez entrer votre adresse email' }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('Erreur de réinitialisation:', error)
      return { error: 'Erreur lors de l\'envoi de l\'email de réinitialisation' }
    }

    return { 
      success: 'Un email de réinitialisation a été envoyé à ' + email 
    }

  } catch (error) {
    console.error('Erreur inattendue:', error)
    return { error: 'Une erreur inattendue s\'est produite' }
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createServerClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Veuillez remplir tous les champs' }
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error('Erreur de mise à jour:', error)
      return { error: 'Erreur lors de la mise à jour du mot de passe' }
    }

    return { 
      success: 'Mot de passe mis à jour avec succès'
    }

  } catch (error) {
    console.error('Erreur inattendue:', error)
    return { error: 'Une erreur inattendue s\'est produite' }
  }
}