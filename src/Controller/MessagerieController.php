<?php
// src/Controller/MessagerieController.php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\Conversation;
use App\Entity\User;
use App\Repository\MessageRepository;
use App\Repository\UserRepository;
use App\Repository\ConversationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Core\User\UserInterface;

class MessagerieController extends AbstractController
{
    #[Route('/messagerie', name: 'app_messagerie')]
    public function index(
        #[CurrentUser] User $currentUser,
        UserRepository $userRepository,
        ConversationRepository $conversationRepository
    ): Response {
        // Récupérer toutes les conversations de l'utilisateur
        $conversations = $conversationRepository->findConversationsForUser($currentUser);

        // Récupérer tous les utilisateurs (sauf l'actuel) pour la liste de contacts
        $users = $userRepository->findAllExcept($currentUser->getId());

        // Calculer le total des messages non lus
        $totalUnread = 0;
        foreach ($conversations as $conversation) {
            $totalUnread += $conversation->getUnreadCountForUser($currentUser);
        }

        return $this->render('messagerie/messagerie.html.twig', [
            'currentUser' => $currentUser,
            'conversations' => $conversations,
            'users' => $users,
            'unreadCount' => $totalUnread,
        ]);
    }

    #[Route('/messagerie/send/{userId}', name: 'app_messagerie_send', methods: ['POST'])]
    public function sendMessage(
        Request $request,
        int $userId,
        #[CurrentUser] User $currentUser,
        UserRepository $userRepository,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
            // Log pour debugging
    error_log("Tentative d'envoi de message à l'utilisateur: " . $userId);
    error_log("Utilisateur courant: " . $currentUser->getId());
        $content = $request->request->get('content');

        if (empty(trim($content))) {
                    error_log("Message vide");
            return $this->json(['success' => false, 'message' => 'Le message ne peut pas être vide']);
        }

        $receiver = $userRepository->find($userId);
        if (!$receiver) {
                    error_log("Destinataire introuvable: " . $userId);
            return $this->json(['success' => false, 'message' => 'Destinataire introuvable']);
        }

        // Chercher ou créer une conversation
        $conversation = $conversationRepository->findConversationBetweenUsers($currentUser, $receiver);

        if (!$conversation) {
            $conversation = new Conversation();
            $conversation->setUser1($currentUser);
            $conversation->setUser2($receiver);
            $conversation->setCreatedAt(new \DateTimeImmutable());
            $conversation->setUpdatedAt(new \DateTimeImmutable());

            $entityManager->persist($conversation);
        }

        // Créer le message
        $message = new Message();
        $message->setContent(trim($content));
        $message->setSender($currentUser);
        $message->setReceiver($receiver);
        $message->setConversation($conversation);
        $message->setCreatedAt(new \DateTimeImmutable());

        // Incrémenter le compteur de messages non lus pour le destinataire
        $conversation->incrementUnreadCount($receiver);
        $conversation->setLastMessageAt(new \DateTimeImmutable());
        $conversation->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->persist($message);
        $entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'senderId' => $message->getSender()->getId(),
                'receiverId' => $message->getReceiver()->getId(),
                'createdAt' => $message->getFormattedCreatedAt(),
                'date' => $message->getFormattedDate(),
            ]
        ]);
    }

    #[Route('/messagerie/conversation/{conversationId}', name: 'app_messagerie_conversation')]
    public function getConversation(
        int $conversationId,
        #[CurrentUser] User $currentUser,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager
    ): Response {
        $conversation = $conversationRepository->find($conversationId);

        if (!$conversation) {
            throw $this->createNotFoundException('Conversation non trouvée');
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if ($conversation->getUser1()->getId() !== $currentUser->getId() &&
            $conversation->getUser2()->getId() !== $currentUser->getId()) {
            throw $this->createAccessDeniedException('Accès non autorisé');
        }

        // Marquer les messages comme lus
        foreach ($conversation->getMessages() as $message) {
            if ($message->getReceiver()->getId() === $currentUser->getId() && !$message->isIsRead()) {
                $message->setIsRead(true);
                $message->setReadAt(new \DateTimeImmutable());
            }
        }

        // Réinitialiser le compteur de messages non lus
        $conversation->resetUnreadCount($currentUser);

        $entityManager->flush();

        return $this->render('messagerie/_conversation.html.twig', [
            'currentUser' => $currentUser,
            'conversation' => $conversation,
            'otherUser' => $conversation->getOtherUser($currentUser),
            'messages' => $conversation->getMessages(),
        ]);
    }

    #[Route('/messagerie/check-new/{conversationId}', name: 'app_messagerie_check_new')]
    public function checkNewMessages(
        int $conversationId,
        #[CurrentUser] User $currentUser,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $conversation = $conversationRepository->find($conversationId);

        if (!$conversation) {
            return $this->json(['success' => false, 'message' => 'Conversation non trouvée']);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if ($conversation->getUser1()->getId() !== $currentUser->getId() &&
            $conversation->getUser2()->getId() !== $currentUser->getId()) {
            return $this->json(['success' => false, 'message' => 'Accès non autorisé']);
        }

        // Récupérer les nouveaux messages (non lus) pour l'utilisateur courant
        $newMessages = [];
        foreach ($conversation->getMessages() as $message) {
            if ($message->getReceiver()->getId() === $currentUser->getId() && !$message->isIsRead()) {
                $newMessages[] = $message;
            }
        }

        $messagesData = [];
        foreach ($newMessages as $message) {
            $messagesData[] = [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'senderId' => $message->getSender()->getId(),
                'createdAt' => $message->getFormattedCreatedAt(),
                'date' => $message->getFormattedDate(),
            ];
            // Marquer comme lu
            $message->setIsRead(true);
            $message->setReadAt(new \DateTimeImmutable());
        }

        $entityManager->flush();

        return $this->json([
            'success' => true,
            'messages' => $messagesData,
            'count' => count($messagesData)
        ]);
    }

    #[Route('/messagerie/unread-count', name: 'app_messagerie_unread_count')]
    public function getUnreadCount(
        #[CurrentUser] User $currentUser,
        ConversationRepository $conversationRepository
    ): JsonResponse {
        $conversations = $conversationRepository->findConversationsForUser($currentUser);

        $totalUnread = 0;
        foreach ($conversations as $conversation) {
            $totalUnread += $conversation->getUnreadCountForUser($currentUser);
        }

        return $this->json(['count' => $totalUnread]);
    }

    #[Route('/messagerie/mark-read/{conversationId}', name: 'app_messagerie_mark_read', methods: ['POST'])]
    public function markAsRead(
        int $conversationId,
        #[CurrentUser] User $currentUser,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $conversation = $conversationRepository->find($conversationId);

        if (!$conversation) {
            return $this->json(['success' => false, 'message' => 'Conversation non trouvée']);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if ($conversation->getUser1()->getId() !== $currentUser->getId() &&
            $conversation->getUser2()->getId() !== $currentUser->getId()) {
            return $this->json(['success' => false, 'message' => 'Accès non autorisé']);
        }

        // Marquer tous les messages de la conversation comme lus
        foreach ($conversation->getMessages() as $message) {
            if ($message->getReceiver()->getId() === $currentUser->getId() && !$message->isIsRead()) {
                $message->setIsRead(true);
                $message->setReadAt(new \DateTimeImmutable());
            }
        }

        // Réinitialiser le compteur de messages non lus
        $conversation->resetUnreadCount($currentUser);

        $entityManager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/messagerie/start-conversation/{userId}', name: 'app_messagerie_start_conversation', methods: ['POST'])]
    public function startConversation(
        int $userId,
        #[CurrentUser] User $currentUser,
        UserRepository $userRepository,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $receiver = $userRepository->find($userId);

        if (!$receiver) {
            return $this->json(['success' => false, 'message' => 'Utilisateur introuvable']);
        }

        // Vérifier si une conversation existe déjà
        $conversation = $conversationRepository->findConversationBetweenUsers($currentUser, $receiver);

        if (!$conversation) {
            // Créer une nouvelle conversation
            $conversation = new Conversation();
            $conversation->setUser1($currentUser);
            $conversation->setUser2($receiver);
            $conversation->setCreatedAt(new \DateTimeImmutable());
            $conversation->setUpdatedAt(new \DateTimeImmutable());

            $entityManager->persist($conversation);
            $entityManager->flush();
        }

        return $this->json([
            'success' => true,
            'conversationId' => $conversation->getId(),
            'userId' => $receiver->getId(),
            'userName' => $receiver->getFullName()
        ]);
    }



#c'est pour vérifier la conversation existante entre deux utilisateurs

    #[Route('/messagerie/get-or-create-conversation/{userId}', name: 'app_messagerie_get_or_create', methods: ['POST'])]
public function getOrCreateConversation(
    int $userId,
    #[CurrentUser] User $currentUser,
    UserRepository $userRepository,
    ConversationRepository $conversationRepository,
    EntityManagerInterface $entityManager
): JsonResponse {
    $otherUser = $userRepository->find($userId);

    if (!$otherUser) {
        return $this->json(['success' => false, 'message' => 'Utilisateur introuvable']);
    }

    // Chercher une conversation existante
    $conversation = $conversationRepository->findConversationBetweenUsers($currentUser, $otherUser);

    if (!$conversation) {
        // Créer une nouvelle conversation
        $conversation = new Conversation();
        $conversation->setUser1($currentUser);
        $conversation->setUser2($otherUser);
        $conversation->setCreatedAt(new \DateTimeImmutable());
        $conversation->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->persist($conversation);
        $entityManager->flush();
    }

    return $this->json([
        'success' => true,
        'conversationId' => $conversation->getId(),
        'userId' => $otherUser->getId(),
        'userName' => $otherUser->getFullName()
    ]);
}


// src/Controller/MessagerieController.php
#[Route('/messagerie/chat/{userId}', name: 'app_messagerie_chat')]
public function chat(
    int $userId,
    #[CurrentUser] User $currentUser,
    UserRepository $userRepository,
    ConversationRepository $conversationRepository,
    EntityManagerInterface $entityManager
): Response {
    $otherUser = $userRepository->find($userId);

    if (!$otherUser) {
        throw $this->createNotFoundException('Utilisateur non trouvé');
    }

    // Trouver ou créer la conversation
    $conversation = $conversationRepository->findOrCreateConversation($currentUser, $otherUser);

    // Marquer les messages comme lus
    foreach ($conversation->getMessages() as $message) {
        if ($message->getReceiver()->getId() === $currentUser->getId() && !$message->isIsRead()) {
            $message->setIsRead(true);
            $message->setReadAt(new \DateTimeImmutable());
        }
    }

    // Réinitialiser le compteur de messages non lus
    $conversation->resetUnreadCount($currentUser);

    $entityManager->flush();

    return $this->render('messagerie/_conversation.html.twig', [
        'currentUser' => $currentUser,
        'conversation' => $conversation,
        'otherUser' => $conversation->getOtherUser($currentUser),
        'messages' => $conversation->getMessages(),
    ]);
}
}
