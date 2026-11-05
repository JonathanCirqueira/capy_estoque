<x-mail::message>
# Olá, {{ $usuario->name }}!

Você foi convidado para acessar a plataforma do **CapyEstoque** como **{{ $usuario->role->label() }}**.

Para ativar sua conta e definir sua senha de acesso, clique no botão abaixo:

<x-mail::button :url="$url">
Aceitar Convite e Definir Senha
</x-mail::button>

Este link é seguro e possui validade de **7 dias**.

Se você não esperava por este convite, nenhuma ação é necessária e você pode desconsiderar esta mensagem.

Atenciosamente,<br>
Equipe {{ config('app.name') }}
</x-mail::message>
