<?php
// src/Controller/NotificationController.php

namespace App\Controller;

use App\Service\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Repository\NotificationRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\User;

class NotificationController extends AbstractController
{
    #[Route('/notifications', name: 'app_notifications')]
    #[IsGranted('ROLE_USER')]
    public function index(NotificationRepository $notificationRepository): Response
    {
        $user = $this->getUser();

        // Récupérer toutes les notifications de l'utilisateur (lues et non lues)
        $notifications = $notificationRepository->createQueryBuilder('n')
            ->where('n.user = :user')
            ->setParameter('user', $user)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        return $this->render('notification/notification.html.twig', [
            'notifications' => $notifications,
            'unread_count' => $notificationRepository->countUnreadForUser($user),
        ]);
    }
    #[Route('/api/notifications', name: 'api_notifications', methods: ['GET'])]
    public function getNotifications(
        #[CurrentUser] User $user,
        NotificationService $notificationService
    ): JsonResponse {
        $notifications = $notificationService->getUnreadNotifications($user);

        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'createdAt' => $notification->getFormattedCreatedAt(),
                'route' => $notification->getRoute(),
                'routeParams' => $notification->getRouteParams(),
            ];
        }

        return $this->json([
            'success' => true,
            'notifications' => $data,
            'count' => count($data)
        ]);
    }

    #[Route('/api/notifications/mark-read/{id}', name: 'api_notifications_mark_read', methods: ['POST'])]
      #[IsGranted('ROLE_USER')]
    public function markAsRead(
        int $id,
        #[CurrentUser] User $user,
        NotificationService $notificationService
    ): JsonResponse {
        $success = $notificationService->markAsRead($id, $user);

        return $this->json([
            'success' => $success
        ]);
    }

    #[Route('/api/notifications/mark-all-read', name: 'api_notifications_mark_all_read', methods: ['POST'])]
      #[IsGranted('ROLE_USER')]
    public function markAllAsRead(
        #[CurrentUser] User $user,
        NotificationService $notificationService
    ): JsonResponse {
        $notificationService->markAllAsRead($user);

        return $this->json([
            'success' => true
        ]);
    }

    #[Route('/api/notifications/count', name: 'api_notifications_count', methods: ['GET'])]
    public function getNotificationCount(
        #[CurrentUser] User $user,
        NotificationService $notificationService
    ): JsonResponse {
        $count = $notificationService->getUnreadCount($user);

        return $this->json([
            'success' => true,
            'count' => $count
        ]);
    }

#[Route('/api/notifications/all', name: 'api_notifications_all', methods: ['GET'])]
public function getAllNotifications(
    #[CurrentUser] User $user,
    NotificationRepository $notificationRepository
): JsonResponse {
    // Récupérer toutes les notifications (lues et non lues)
    $notifications = $notificationRepository->createQueryBuilder('n')
        ->where('n.user = :user')
        ->setParameter('user', $user)
        ->orderBy('n.createdAt', 'DESC')
        ->getQuery()
        ->getResult();

    $data = [];
    foreach ($notifications as $notification) {
        $data[] = [
            'id' => $notification->getId(),
            'type' => $notification->getType(),
            'title' => $notification->getTitle(),
            'message' => $notification->getMessage(),
            'isRead' => $notification->isIsRead(),
            'createdAt' => $notification->getFormattedCreatedAt(),
            'route' => $notification->getRoute(),
            'routeParams' => $notification->getRouteParams(),
        ];
    }

    return $this->json([
        'success' => true,
        'notifications' => $data,
        'count' => count($data)
    ]);
}
}
