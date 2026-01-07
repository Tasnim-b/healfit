<?php
// src/Service/NotificationService.php

namespace App\Service;

use App\Entity\User;
use App\Entity\Message;
use App\Entity\Notification;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    private $notificationRepository;
    private $entityManager;

    public function __construct(
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->notificationRepository = $notificationRepository;
        $this->entityManager = $entityManager;
    }

    public function notifyNewMessage(Message $message): void
    {
        $notification = $this->notificationRepository->createMessageNotification(
            $message->getReceiver(),
            $message->getSender(),
            $message->getContent()
        );

        // Vous pouvez ajouter ici l'envoi de notifications push (WebSocket, email, etc.)
    }

  // src/Service/NotificationService.php (ajoutez cette méthode si elle n'existe pas)

public function sendWaterReminder(User $user): void
{
    // Créer une notification de rappel d'eau
    $notification = new Notification();
    $notification->setUser($user);
    $notification->setType(Notification::TYPE_WATER_REMINDER);
    $notification->setTitle('💧 Rappel d\'hydratation');
    $notification->setMessage('N\'oubliez pas de boire un verre d\'eau pour rester hydraté !');
    $notification->setRoute('app_dashboard');
    $notification->setRouteParams([]);

    $this->entityManager->persist($notification);
    $this->entityManager->flush();
}

    public function sendWaterReminderToAllActiveUsers(): void
    {
        // Récupérer tous les utilisateurs actifs (ex: connectés dans les dernières 24h)
        $users = $this->entityManager->getRepository(User::class)
            ->createQueryBuilder('u')
            ->where('u.updatedAt >= :date')
            ->setParameter('date', new \DateTimeImmutable('-24 hours'))
            ->getQuery()
            ->getResult();

        foreach ($users as $user) {
            $this->sendWaterReminder($user);
        }
    }

    public function getUnreadCount(User $user): int
    {
        return $this->notificationRepository->countUnreadForUser($user);
    }

    public function getUnreadNotifications(User $user): array
    {
        return $this->notificationRepository->findUnreadForUser($user);
    }

    public function markAsRead(int $notificationId, User $user): bool
    {
        return $this->notificationRepository->markAsRead($notificationId, $user);
    }

    public function markAllAsRead(User $user): void
    {
        $this->notificationRepository->markAllAsReadForUser($user);
    }
}
